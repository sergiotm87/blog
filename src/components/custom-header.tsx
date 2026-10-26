import Logo from "@/components/logo";
import React from "react";

const CustomHeader = async () => {
	return (
		<div className="custom-header flex items-center justify-between mb-10">
			<div className="flex items-center gap-2">
				<Logo />
			</div>
		</div>
	);
};

export default CustomHeader;
