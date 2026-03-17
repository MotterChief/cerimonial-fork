'use client';

const HeaderHelper = ({ children }) => {

    return (
        <>
            <div className="helper-message">
                <span>{children}</span>
            </div>
        </>
    );
}

export default HeaderHelper;