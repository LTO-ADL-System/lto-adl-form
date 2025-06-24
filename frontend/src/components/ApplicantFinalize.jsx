import person from "../assets/person.png";
import car from "../assets/car.png";
import document from "../assets/document.png";
import check from "../assets/check.png";

const ApplicantFinalize = () => {
  return (
    <div className=" flex flex-col font-sans bg-gray-100">
      {/* This div is just for spacing, as in your original code */}
      <div className="h-16 flex-shrink-0"></div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <main className="w-full max-w-5xl mx-auto flex flex-col">
          {/* The main card container */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 flex flex-col w-full h-full">
            {/* Step Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                {/* Step 1 - Personal */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <img src={person} alt="" width={30} height={30} />
                  </div>
                  <span className="text-green-500 font-medium text-sm">
                    Personal
                  </span>
                  <div className="w-25 h-1 bg-green-500 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 1</span>
                </div>

                {/* Step 2 - License Details */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <img src={car} alt="" width={30} height={30} />
                  </div>
                  <span className="text-green-500 font-medium text-sm">
                    License Details
                  </span>
                  <div className="w-25 h-1 bg-green-500 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 2</span>
                </div>

                {/* Step 3 - Documents */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={document} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Documents
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 3</span>
                </div>
                {/* Step 4 - Finalize */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                    <img src={check} alt="" width={30} height={30} />
                  </div>
                  <span className="text-gray-600 font-medium text-sm">
                    Finalize
                  </span>
                  <div className="w-25 h-1 bg-gray-300 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 4</span>
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicantFinalize;
