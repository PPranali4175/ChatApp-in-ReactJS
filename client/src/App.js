import { BrowserRouter as Router , Route, Routes} from 'react-router-dom';
import Chat from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import { ListToChatPage } from './pages/ListToChatPage';

function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/list' element={<ListToChatPage/>}/>
      </Routes>
    </Router>
    
    </>
  );
}

export default App;
