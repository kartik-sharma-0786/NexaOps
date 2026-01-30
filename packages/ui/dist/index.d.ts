import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}
declare function Button({ children, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;

export { Button, type ButtonProps };
