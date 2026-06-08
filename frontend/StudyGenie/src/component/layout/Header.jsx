import React from 'react';
import {useAuth} from "../../context/AuthContext";
import {Bell, User, Menu} from 'lucide-react';
const Header =({toggleSidebar})=>{
  const {user} = useAuth();

return(
  <header className='sticky top-0 z-40 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border/60'>
    <div className='flex items-center justify-between h-full px-6'>
      {/*Mobile Menu Button*/}
      <button
      onClick={toggleSidebar}
      className='md:hidden inline-flex items-center justify-center w-10 h-10 text-body hover:text-heading hover:bg-section-background rounded-xl transition-all duration-200'
      arial-label="Toggle sidebar">
      <Menu size={24}/>
      </button>
   
    <div className='hidden md:block'> </div>
    <div className='flex items-center gap-3'>
      <button className='relative inline-flex items-center justify-center w-10 h-10 text-body hover:text-heading hover:bg-section-background rounded-xl transition-all duration-200 group'>
         <Bell size={20} strokeWidth={2} className='group-hover:scale-110 transition-transform duration-200'/>

         <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-background'></span>
      </button>
      {/*User Profile*/}
      <div className='flex items-center gap-3 pl-3 border-l border-border/60'>
        <div className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-section-background transition-colors duration-200 cursor-pointer group'>
          <div className='w-9 h-9 rounded-xl bg-linear-to-br from-primary-light to-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:shadow-lg group-hover:shadow-brand-primary/30 transition-all duration-200'>
            <User size={18} strokeWidth={2.5}/>
          </div>
          <div>
            <p className='text-sm font-semibold text-heading'>
              {user?.username|| 'User'}
            </p>
            <p className='text-xs text-body'>
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </header>
);
  
}
export default Header;
