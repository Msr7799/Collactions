//app-icon.tsx component
import Image from "next/image";

const AppIcon = () => {
    return (
        <Image
            src="/app-icon-black.svg"
            alt="Collactions Logo"
            width={150}
            height={150}
    
            className="border-8 bg-[#CBD0D0FF] z-50 !border-[var(--user-bg)]/80 rounded-4xl shadow-lg p-2"
        />
    );
};

export default AppIcon;
