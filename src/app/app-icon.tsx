//app-icon.tsx component
import Image from "next/image";

const AppIcon = () => {
    return (
        <Image
            src="/app-icon-black.svg"
            alt="Collactions Logo"
            width={100}
            height={100}
    
            className="border-2 bg-[#040708] rounded-4xl shadow-lg p-2"
        />
    );
};

export default AppIcon;
