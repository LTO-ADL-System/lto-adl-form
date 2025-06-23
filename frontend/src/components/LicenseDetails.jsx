import person from "../assets/person.png";
import car from "../assets/car.png";
import document from "../assets/document.png";
import check from "../assets/check.png";
import A from "../assets/license_details/A.svg";
import A1 from "../assets/license_details/A1.svg";
import BE from "../assets/license_details/BE.svg";
import B1 from "../assets/license_details/B1.svg";
import B2 from "../assets/license_details/B2.svg";
import C from "../assets/license_details/C.svg";
import CE from "../assets/license_details/CE.svg";
import D from "../assets/license_details/D.svg";

const LicenseDetails = () => {
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
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={person} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Personal
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 1</span>
                </div>

                {/* Step 2 - License Details */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={car} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    License Details
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
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
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <img src={check} alt="" width={30} height={30} />
                  </div>
                  <span className="text-blue-600 font-medium text-sm">
                    Finalize
                  </span>
                  <div className="w-25 h-1 bg-blue-600 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 4</span>
                </div>
              </div>
            </div>

            {/* License Details Section */}
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <img src={car} alt="License icon" width={24} height={24} />
                License Details
              </h2>

              {/* Organ Donation */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Organ Donation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="organDonor"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organ Donor*
                    </label>
                    <select
                      id="organDonor"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                      <option>Yes or No</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="organs"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Organs
                    </label>
                    <select
                      id="organs"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                      <option>Select Organs</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Driving Conditions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Driving Conditions
                </h3>
                <div>
                  <label
                    htmlFor="conditions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Conditions*
                  </label>
                  <select
                    id="conditions"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option>Select Conditions</option>
                  </select>
                </div>
              </div>

              {/* Driving Skill Acquisition */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Driving Skill Acquisition
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="drivingSkill"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Driving Skill*
                    </label>
                    <select
                      id="drivingSkill"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                      <option>Driving Skill Acquisition</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="driverLicenseNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Driver's License Number*
                    </label>
                    <div className="flex items-center mt-1">
                      <input
                        type="text"
                        id="driverLicenseNumber"
                        placeholder="A00-25-000000"
                        className="flex-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                      />
                      <label className="ml-4 flex items-center text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 whitespace-nowrap">
                          New Application
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                  Select Acquisition of Skill to Proceed
                </div>
              </div>

              {/* Driver's License Vehicle Category */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Driver's License Vehicle Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors bg-blue-500 text-white">
                    <img src={A} alt="Motorcycle" className="mb-2 w-12 h-12" />
                    <span className="text-sm font-medium">A</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img src={A1} alt="Tricycle" className="mb-2 w-12 h-12" />
                    <span className="text-sm font-medium">A1</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img src={B1} alt="Truck small" className="mb-2 w-12 h-12" />
                    <span className="text-sm font-medium">B1</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img
                      src={B2}
                      alt="Truck medium"
                      className="mb-2 w-12 h-12"
                    />
                    <span className="text-sm font-medium">B2</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img src={B2} alt="Bus large" className="mb-2 w-12 h-12" />
                    <span className="text-sm font-medium">D</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img
                      src={BE}
                      alt="Car with trailer"
                      className="mb-2 w-12 h-12"
                    />
                    <span className="text-sm font-medium">BE</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img
                      src={C}
                      alt="Truck with trailer"
                      className="mb-2 w-12 h-12"
                    />
                    <span className="text-sm font-medium">CE</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img
                      src={CE}
                      alt="Truck with trailer"
                      className="mb-2 w-12 h-12"
                    />
                    <span className="text-sm font-medium">CE</span>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm cursor-pointer hover:border-blue-500 transition-colors">
                    <img
                      src={D}
                      alt="Truck with trailer"
                      className="mb-2 w-12 h-12"
                    />
                    <span className="text-sm font-medium">CE</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <button className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Save & Exit
                </button>
                <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Proceed
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LicenseDetails;
