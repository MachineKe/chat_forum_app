import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/src/App.jsx'
import { MediaPlayerProvider } from '@components/media/MediaPlayerContext'
import { AuthProvider } from '@hooks/useAuth.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <MediaPlayerProvider>
      <App />
    </MediaPlayerProvider>
  </AuthProvider>,
)
