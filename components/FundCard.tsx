import React from 'react';

interface FundCardProps {
  owner: string;
  title: string;
  description: string;
  target: number;
  deadline: string;
  amountCollected: number;
  image: string;
  handleClick: () => void;
}
interface DaysLeftFunction {
  (deadline: string): string;
}

const daysLeft: DaysLeftFunction = (deadline) => {
  const difference = new Date(deadline).getTime() - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};
const FundCard: React.FC<FundCardProps> = ({ owner, title, description, target, deadline, amountCollected, image, handleClick }) => {
  const remainingDays = daysLeft(deadline);

  return (
    <div
      className="sm:w-[388px] w-full rounded-[15px] bg-[#ffffff] cursor-pointer border-[1px] border-[#3a3a433d] shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={handleClick}
    >
      <img
        src={image}
        alt="fund"
        className="w-full h-[158px] object-cover rounded-t-[15px]"
      />

      <div className="flex flex-col p-4">
        {/* Tag */}
        <div className="flex flex-row items-center mb-[18px]">\
          <img src="./tag.svg" alt="" />
          <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#000000]">
            Education
          </p>
        </div>

        {/* Title & Description */}
        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-[#000000] text-left leading-[26px] truncate">
            {title}
          </h3>
        </div>
        {/* Raised & Days Left */}
        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#46c874] leading-[22px]">
              {amountCollected}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#94a3b8] sm:max-w-[120px] truncate">
              Raised of {target}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#00000078] leading-[22px]">
              {remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#94a3b8] sm:max-w-[120px] truncate">
              Days Left
            </p>
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center mt-[20px] gap-[12px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#334155]">
          <img src="./user.svg" alt="" />
          </div>
          <p className="flex-1 font-epilogue font-normal text-[12px] text-[#94a3b8] truncate">
            by <span className="text-[#000000]">{owner}</span>
          </p>
        </div>
      </div>
    </div>

  )
}

export default FundCard