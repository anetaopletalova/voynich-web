import React from 'react';

interface IButtonProps {
    isSubmit?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    children?: string;
}

export const Button: React.FC<IButtonProps> = ({
    isSubmit,
    disabled,
    children,
    onClick,
}) => {
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        console.log(event)
        if (onClick) onClick();
    };

    return (
        <button
            type={isSubmit ? 'submit' : 'button'}
            // className={classNames('mb-button', {
            //     [type]: type,
            //     loading: isSubmitting,
            // })}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
