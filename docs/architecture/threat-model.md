# Security Threat Model: Lungilicious Botanical Wellness

## 1. Executive Summary

Lungilicious is a premium botanical wellness e-commerce platform designed to provide a seamless and secure shopping experience for high-end health products. The system follows a modular monolith architecture, leveraging the NestJS framework for the backend and Next.js for the frontend. Data persistence is handled by PostgreSQL, while Redis manages session state and caching. As a platform dealing with customer personal information and financial transactions, security is a core requirement rather than an afterthought. This threat model identifies potential security risks across the application's lifecycle and defines the necessary controls to mitigate them. By adopting a proactive security posture, we protect our customers' trust and ensure the long-term viability of the platform.

## 2. Scope

The scope of this threat model encompasses the entire Lungilicious digital ecosystem. It covers the following functional areas:

*   **Authentication and Identity:** This includes user registration, login, password management, and session handling. We must protect user accounts from unauthorized access and spoofing.
*   **Commerce and Order Management:** This covers the product catalog, shopping cart functionality, and the order lifecycle. We must ensure product data integrity and resilient order processing.
*   **Payments Integration:** The platform integrates with Peach Payments, a leading South African payment gateway. The scope includes the secure handoff to the payment provider and the handling of asynchronous webhooks for payment confirmation.
*   **Content Management:** This involves the delivery of product information, blog content, and marketing materials. We must prevent unauthorized content modification.
*   **Administrative Operations:** The admin dashboard allows staff to manage inventory, view orders, and handle customer support. This area requires maximum protection due to its sensitive nature.

## 3. Assets Table

We've identified the following critical assets that require protection. Each asset has specific security goals associated with it.

| Asset | Description | Protection Goal |
| :--- | :--- | :--- |
| Customer PII | Personal Identifiable Information including names, email addresses, phone numbers, and physical shipping addresses. | Confidentiality and Integrity |
| Payment Tokens | Reference tokens and metadata provided by Peach Payments. We don't store raw card data. | Confidentiality |
| Session Data | Server-side session state stored in Redis and the corresponding session identifiers in client cookies. | Integrity and Availability |
| Product Data | Information regarding product pricing, descriptions, and inventory levels. | Integrity and Availability |
| Admin Credentials | Usernames and password hashes for accounts with administrative privileges. | Confidentiality and Integrity |
| Audit Logs | Immutable records of system events, administrative actions, and security-relevant changes. | Integrity and Non-repudiation |
| System Secrets | API keys for third-party services, database credentials, and session signing secrets. | Confidentiality |

## 4. Trust Boundaries

Trust boundaries define the points where data crosses from one level of trust to another.

*   **Frontend to API Boundary:** This is the most exposed boundary. Data travels from the customer's browser over the public internet to our NestJS API. We must treat all input from this source as untrusted and perform rigorous validation.
*   **API to Database Boundary:** While both components reside within our internal network, this boundary requires authenticated access. We use Prisma ORM to interact with PostgreSQL, ensuring that queries are parameterized to prevent injection.
*   **API to Redis Boundary:** This boundary handles session data and cached content. Access is restricted to the API service, and we ensure that session data is handled securely to prevent unauthorized access to user states.
*   **API to Payment Provider Boundary:** This is an external boundary between our API and Peach Payments. Communication occurs over HTTPS, and we use HMAC signatures to verify the authenticity of messages received from the provider.
*   **API to Object Storage Boundary:** This boundary is used for storing and retrieving media assets like product images. We use secure SDKs and IAM roles to manage access, ensuring that only authorized processes can upload or modify files.

## 5. Data Flow Diagram

The following diagram illustrates how data moves through the Lungilicious platform and where the trust boundaries exist.

```text
[ Customer Browser ]
       |
       | (HTTPS / JSON / Cookies)
       | [ Trust Boundary: Public Internet ]
       v
[ Next.js Frontend ]
       |
       | (Server-to-Server API Calls)
       | [ Trust Boundary: Internal Network ]
       v
[ NestJS API (Modular Monolith) ]
       |
       +----(SQL / Prisma)----> [ PostgreSQL ]
       |    [ Trust Boundary: Database Access ]
       |
       +----(RESP)------------> [ Redis (Sessions/Cache) ]
       |    [ Trust Boundary: Cache Access ]
       |
       +----(HTTPS / HMAC)----> [ Peach Payments ]
       |    [ Trust Boundary: External Payment Gateway ]
       |
       +----(HTTPS / SDK)-----> [ S3 / Object Storage ]
            [ Trust Boundary: External Storage ]
```

## 6. STRIDE Analysis Table

The STRIDE model helps us categorize and analyze threats systematically. The following table outlines the primary threats identified for the Lungilicious platform.

| Threat ID | Name | STRIDE Category | Attack Vector | Likelihood | Impact | Risk Score | Mitigation | Residual Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T1 | Credential Stuffing | Spoofing | Automated login attempts using leaked credentials from other platforms. | High | High | 9 | Use Argon2id for hashing. Implement rate limiting and account lockout policies. | Low |
| T2 | Session Hijacking | Spoofing | Stealing session cookies via XSS or network interception. | Medium | High | 6 | Use HttpOnly, Secure, and SameSite=Strict cookies. Rotate sessions on login. | Low |
| T3 | CSRF | Tampering | Forcing a logged-in user to execute unwanted actions on the platform. | Medium | High | 6 | Use SameSite=Strict cookies and implement CSRF tokens for state-changing requests. | Low |
| T4 | Account Enumeration | Info Disclosure | Using login or registration responses to confirm the existence of user accounts. | Medium | Medium | 4 | Return generic error messages. Ensure consistent response times for all attempts. | Low |
| T5 | Card Data Exposure | Info Disclosure | Unauthorized access to raw credit card numbers or sensitive payment details. | Low | Critical | 5 | Use Peach Payments hosted checkout. Never store or process raw card data (PAN). | Negligible |
| T6 | Webhook Replay | Tampering | Re-sending payment confirmation webhooks to trigger duplicate order fulfillment. | Medium | High | 6 | Verify HMAC-SHA256 signatures on all webhooks. Use idempotency keys for processing. | Low |
| T7 | Payment Manipulation | Tampering | Modifying the order total in the frontend before initiating the payment process. | Medium | Critical | 8 | Recalculate the order total on the server side. Never trust the amount from the client. | Low |
| T8 | SQL Injection | Tampering | Injecting malicious SQL commands through user-supplied input fields. | Low | Critical | 5 | Use Prisma ORM with parameterized queries. Avoid any raw SQL string concatenation. | Low |
| T9 | IDOR | Broken Access | Accessing other users' data by manipulating resource identifiers in requests. | Medium | High | 6 | Implement strict resource ownership checks. Use NestJS guards for RBAC. | Low |
| T10 | Privilege Escalation | Elevation | A regular user gaining admin access by modifying their role in a request or session. | Medium | Critical | 8 | Enforce RBAC strictly on the server side. Don't allow clients to set or change roles. | Low |
| T11 | Secret Leakage | Info Disclosure | Exposing API keys or database credentials in logs, code, or error messages. | Medium | High | 6 | Store secrets in environment variables. Use Zod for validation. Never hardcode values. | Low |
| T12 | Dependency Vulnerabilities | Various | Exploiting known security flaws in third-party libraries or frameworks. | Medium | Medium | 4 | Run npm audit regularly. Use Dependabot. Implement container image scanning. | Medium |
| T13 | Denial of Service | DoS | Overwhelming the API with a high volume of requests to disrupt service. | Medium | Medium | 4 | Implement rate limiting. Set request body size limits. Use a WAF if necessary. | Medium |
| T14 | Audit Log Tampering | Repudiation | Deleting or modifying logs to cover up unauthorized or malicious activities. | Low | High | 3 | Use an append-only audit_logs table. Restrict UPDATE and DELETE permissions. | Low |

## 7. PCI Scope Assessment

Lungilicious prioritizes the security of customer financial data by minimizing the platform's exposure to sensitive payment information. We've chosen to implement the Peach Payments hosted checkout model, also known as the redirect model. In this workflow, when a customer is ready to pay, they're redirected to a secure page hosted by Peach Payments. All credit card details are entered directly into their secure environment.

Because raw card data never touches our servers, our infrastructure is significantly insulated from the most stringent PCI DSS requirements. We don't store, process, or transmit Primary Account Numbers (PAN). Our database only stores non-sensitive metadata provided by the gateway, such as:

*   Payment provider transaction references.
*   Secure payment method tokens for future transactions.
*   The last four digits of the card used.
*   The card brand (e.g., Visa, Mastercard).
*   The card's expiry month and year.

This approach allows Lungilicious to qualify for the PCI DSS Self-Assessment Questionnaire A (SAQ-A). This is the simplest level of compliance, suitable for merchants who've completely outsourced their payment processing to a PCI-compliant third party.

## 8. Data Classification Table

To ensure appropriate security controls are applied, we classify all data handled by the platform into four distinct categories.

| Classification | Examples | Handling Requirements |
| :--- | :--- | :--- |
| **PUBLIC** | Product listings, blog posts, FAQ, testimonials, public marketing assets. | No special confidentiality requirements. Integrity must be maintained to prevent defacement. |
| **INTERNAL** | Order analytics, inventory levels, internal staff notes, admin dashboard metadata. | Access is restricted to authorized staff members. Data should be protected from public disclosure. |
| **CONFIDENTIAL** | Customer names, email addresses, phone numbers, shipping addresses, order history. | Must be encrypted at rest. Access is restricted based on the principle of least privilege. |
| **SECRET** | Session signing secrets, API keys, database credentials, Argon2id password hashes. | Must be stored in environment variables. Never committed to version control or included in logs. |

## 9. South African Regulatory Note: POPI Act Compliance

As a South African business, Lungilicious is legally obligated to comply with the Protection of Personal Information Act (POPIA). We take this responsibility seriously and have integrated POPIA principles into our architecture.

*   **Data Minimization:** We only collect and process personal information that's strictly necessary for fulfilling orders and providing our services. We don't ask for or store extraneous data.
*   **Purpose Limitation:** Personal information is used only for the specific purposes for which it was collected. For example, a customer's shipping address is used for delivery and isn't shared with third parties for unrelated marketing.
*   **Consent Management:** We obtain explicit consent from users before sending any marketing communications. Users can easily withdraw this consent at any time through their account settings.
*   **Transparency and Access:** We provide clear information about how we handle personal data. Customers have the right to request access to their information and can ask for it to be corrected or deleted in accordance with the law.
*   **Security Safeguards:** The technical and organizational measures outlined in this threat model serve as our commitment to protecting the integrity and confidentiality of the personal information we hold.
