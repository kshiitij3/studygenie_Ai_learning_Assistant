/* eslint-disable react-refresh/only-export-components */
import React,{ createContext, useContext, useState, useEffect, useCallback} from "react";

const AuthContext = createContext();

export const useAuth =()=>{
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must vxbe used within an AuthProvider");
  }
  return context;
}

export const AuthProvider =({children})=>{
  const [user , setUser]= useState(null);
  const [loading,setLoading] = useState(true);
  const [isAuthenticated,setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
     
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/'
  }, []);

  const checkAuthStatus = useCallback(async ()=>{
    try{
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if(token && userStr){
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    }catch(error){
       console.error('Auth check is failed', error);
       logout();
    }finally{
      setLoading(false);

    }
      }, [logout]);

  useEffect(()=>{
    checkAuthStatus();
  },[checkAuthStatus]);

      const login = useCallback((userData , token)=>{
        localStorage.setItem('token', token);
        localStorage.setItem('user',JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
      }, []);

      const updateUser = useCallback((updatedUserData)=>{
        const newUserData = {...user,...updatedUserData};
        localStorage.setItem('user',JSON.stringify(newUserData));
        setUser(newUserData);
      }, [user]);
    const value ={
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
      checkAuthStatus

    };

    return <AuthContext.Provider value ={value}>{children}  </AuthContext.Provider>;

}
