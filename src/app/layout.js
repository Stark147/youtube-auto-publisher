export const metadata = {
  title: 'YouTube Auto Publisher',
  description: 'Auto publish YouTube videos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
