import React, { useState, useRef } from 'react';
import FileUploadModal from "./FileUploadModal";

const ApplicationDocuments = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleFileUpload = (fieldName) => {
    setCurrentField(fieldName);
    setModalOpen(true);
  };

  const handleFileSelect = (file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [currentField]: file
    }));
  };

  const getFileName = (fieldName) => {
    return uploadedFiles[fieldName]?.name || '';
  };

  return (
    <div className="flex flex-col font-sans bg-gray-100">
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
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
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
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
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
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
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
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-600 font-medium text-sm">
                    Finalize
                  </span>
                  <div className="w-25 h-1 bg-gray-300 mt-2"></div>
                  <span className="text-gray-400 text-xs mt-1">Step 4</span>
                </div>
              </div>
            </div>

            {/* New components and elements below the steps */}
            <div className="border-t border-gray-200 pt-8 mt-4">
              <div className="flex items-center mb-6">
                <svg className="w-6 h-6 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Upload Documentary Requirements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">General Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="validID" className="block text-sm font-medium text-gray-700 mb-1">
                        Valid ID*
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50">
                        <input
                          type="text"
                          id="validID"
                          value={getFileName('validID')}
                          placeholder="No file selected"
                          readOnly
                          className="flex-grow bg-transparent outline-none text-gray-700"
                        />
                        <button
                          onClick={() => handleFileUpload('validID')}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                        >
                          📁
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="medicalCertificate" className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Certificate*
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50">
                        <input
                          type="text"
                          id="medicalCertificate"
                          value={getFileName('medicalCertificate')}
                          placeholder="No file selected"
                          readOnly
                          className="flex-grow bg-transparent outline-none text-gray-700"
                        />
                        <button
                          onClick={() => handleFileUpload('medicalCertificate')}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                        >
                          📁
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Specific Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pdcCertificate" className="block text-sm font-medium text-gray-700 mb-1">
                        PDC Certificate*
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50">
                        <input
                          type="text"
                          id="pdcCertificate"
                          value={getFileName('pdcCertificate')}
                          placeholder="No file selected"
                          readOnly
                          className="flex-grow bg-transparent outline-none text-gray-700"
                        />
                        <button
                          onClick={() => handleFileUpload('pdcCertificate')}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                        >
                          📁
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="studentDriversPermit" className="block text-sm font-medium text-gray-700 mb-1">
                        Valid Student Driver's Permit*
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50">
                        <input
                          type="text"
                          id="studentDriversPermit"
                          value={getFileName('studentDriversPermit')}
                          placeholder="No file selected"
                          readOnly
                          className="flex-grow bg-transparent outline-none text-gray-700"
                        />
                        <button
                          onClick={() => handleFileUpload('studentDriversPermit')}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                        >
                          📁
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button className="flex items-center px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414L8.586 13H4a1 1 0 100 2h4.586l-2.293 2.293a1 1 0 101.414 1.414L12.414 15H16a1 1 0 100-2h-3.586l2.293-2.293a1 1 0 10-1.414-1.414L10 13.586 7.707 10.293zM14 4a1 1 0 00-1 1v2a1 1 0 102 0V5a1 1 0 00-1-1z" />
                  </svg>
                  Save & Exit
                </button>
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Proceed
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onFileSelect={handleFileSelect}
        title={`Upload ${currentField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`}
      />
    </div>
  );
};

export default ApplicationDocuments;