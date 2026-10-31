import type {Metadata} from 'next'
import './globals.css'
export const metadata:Metadata={title:'BIZLINK | Find your people. Make your mark.',description:'Connect, learn, showcase and grow with BIZLINK.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
