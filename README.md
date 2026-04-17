# InvoicePro 🚀

**InvoicePro** is a modern, professional SaaS invoicing platform designed specifically for freelancers, consultants, and small businesses. It simplifies the billing lifecycle through automation, professional PDF generation, and real-time financial tracking.

## ✨ Key Features

- 📊 **Dynamic Dashboard**: Real-time revenue analytics, payment tracking, and status breakdown.
- 📄 **Advanced Invoicing**: Create, duplicate, and manage invoices with professional layouts.
- 🤖 **Automated PDF Generation**: High-quality, compliant PDF generation with custom company branding and bank details (RIB/IBAN).
- 📧 **Direct Email Integration**: Send invoices directly to your clients via SMTP integration.
- 👥 **Client Management**: A centralized directory to manage your contacts and their billing history.
- 🌍 **Bilingual & Multi-Theme**: Full support for English and French, featuring a premium dark and light mode UI.
- 🔒 **Secure Auth**: Robust security using JWT (JSON Web Tokens) and Spring Security.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Modern Vanilla CSS (Custom tokens, Glassmorphism, Responsive design)
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **Framework**: Spring Boot 3 (Java 17)
- **Security**: Spring Security + JWT
- **Persistence**: Spring Data JPA
- **PDF Engine**: OpenPDF / iText
- **Mailing**: Spring Mail (SMTP)

### Database
- **Engine**: PostgreSQL

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- JDK 17
- Maven
- PostgreSQL

### Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Configure your database in `src/main/resources/application.properties`.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

The application is architected for cloud-native deployment:
- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Backend API**: Deployed on [Render](https://render.com)
- **Database**: Managed via [Neo Tech](#) infrastructure

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Made with ❤️ for the Freelance Community.
