import { Github, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "#" },
    { name: "Security", href: "#" },
    { name: "Architecture", href: "#" },
  ],
  developers: [
    { name: "Docs", href: "#" },
    { name: "GitHub", href: "#" },
    { name: "SDK", href: "#" },
    { name: "API", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
  ],
  legal: [
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: MessageCircle, href: "#", label: "Discord" },
  { icon: Github, href: "#", label: "GitHub" },
];

const footerSections = [
  { title: "Product", links: footerLinks.product },
  { title: "Developers", links: footerLinks.developers },
  { title: "Company", links: footerLinks.company },
  { title: "Legal", links: footerLinks.legal },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(124, 58, 237, 0.15)",
        background: "#0d0d18",
        marginTop: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 24px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr) 2fr",
            gap: "32px",
            marginBottom: "32px",
          }}
          className="footer-grid"
        >
          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#475569",
                  marginBottom: "16px",
                }}
              >
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        textDecoration: "none",
                        transition: "color 200ms ease",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#a78bfa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#64748b";
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter + Social */}
          <div>
            <h4
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#475569",
                marginBottom: "16px",
              }}
            >
              Stay Updated
            </h4>

            {/* Email input */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  background: "rgba(124, 58, 237, 0.06)",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12.5px",
                  color: "#e2e8f0",
                  outline: "none",
                  minWidth: 0,
                  transition: "border-color 200ms ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.5)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                style={{
                  background: "linear-gradient(135deg, #1e40af, #7c3aed)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#fff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "opacity 200ms ease",
                  boxShadow: "0 0 12px rgba(124, 58, 237, 0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Subscribe
              </button>
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(124, 58, 237, 0.08)",
                    border: "1px solid rgba(124, 58, 237, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 200ms ease",
                    color: "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                    e.currentTarget.style.color = "#a78bfa";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(124, 58, 237, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.15)";
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Icon style={{ width: "14px", height: "14px" }} />
                </a>
              ))}
            </div>

            {/* Network status */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#34d399",
                    letterSpacing: "0.02em",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#34d399",
                      boxShadow: "0 0 6px #34d399",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  Network Online
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#334155", margin: 0 }}>
                Powered by Polkadot Hub
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: "20px",
            borderTop: "1px solid rgba(124, 58, 237, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#334155", margin: 0 }}>
            © 2026 PrivacyPay. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
        footer input::placeholder {
          color: #334155;
        }
      `}</style>
    </footer>
  );
}