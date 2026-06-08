import React from 'react';

const Button = ({
    children,
    onClick,
    type= 'button',
    disabled = false,
    className = '',
    variant = "primary",
    size = "md",
})=>{
       const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap';
       const variantStyles={
        primary:'bg-gradient-to-r from-brand-primary to-primary-light text-white shadow-lg shadow-brand-primary/25 hover:from-brand-primary hover:to-brand-primary hover:shadow-xl hover:shadow-brand-primary/30',
        secondary: 'bg-section-background text-heading hover:bg-border',
        outline: 'bg-card-background border-2 border-border text-heading hover:bg-section-background hover:border-primary-light',
       };
      
       const sizeStyles ={
        sm:'h-9 px-4 text-xs',
        md:'h-11 px-5 text-sm',
       };

       return(
        <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={[
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        ].join(' ')}
        >
        {children}
        </button>
       );

      } ;

export default Button;
