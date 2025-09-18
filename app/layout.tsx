import './globals.css';
import { AuthProvider } from './auth-context';
import { Header } from './header';
import { Footer } from './footer';

export const metadata = {
  title: 'Dexter • Intelligent agents at your fingertips',
  description: 'Dexter brings realtime voice, multi-agent chat, and MCP tools into one adaptive workspace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="page-shell">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
