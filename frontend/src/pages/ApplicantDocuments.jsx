import person from "../assets/person.svg";
import license from "../assets/license-details.svg";
import document from "../assets/documents.svg";
import finalize from "../assets/finalize.svg";
import React, { useState } from 'react';
import FileUploadModal from "../components/FileUploadModal.jsx";
import applicationDocumentsConfig from "../config/applicant_documents.json";
import BlueDocu from "../assets/blue-docu.svg";

const ApplicationDocuments = ({ onProceed, onBack }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});

  const steps = [
    { name: "Personal", icon: person },
    { name: "License Details", icon: license },
    { name: "Documents", icon: document },
    { name: "Finalize", icon: finalize },
  ];

  const handleFileUpload = (field) => {
    setCurrentField(field);
    setModalOpen(true);
  };

  const handleFileSelect = (file) => {
    if (!currentField) return;

    // Validate file size
    const maxSize = applicationDocumentsConfig.fileValidation.maxFileSize;
    if (file.size > maxSize) {
      setUploadStatus(prev => ({
        ...prev,
        [currentField.name]: {
          type: 'error',
          message: applicationDocumentsConfig.messages.fileSizeError.replace('{maxSize}', currentField.maxSize)
        }
      }));
      return;
    }

    // Validate file type
    const allowedTypes = applicationDocumentsConfig.fileValidation.allowedTypes;
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus(prev => ({
        ...prev,
        [currentField.name]: {
          type: 'error',
          message: applicationDocumentsConfig.messages.fileTypeError.replace('{allowedTypes}', currentField.acceptedFormats.join(', '))
        }
      }));
      return;
    }

    // File is valid, store it
    setUploadedFiles(prev => ({
      ...prev,
      [currentField.name]: file
    }));

    setUploadStatus(prev => ({
      ...prev,
      [currentField.name]: {
        type: 'success',
        message: applicationDocumentsConfig.messages.fileSelected.replace('{fileName}', file.name)
      }
    }));
  };

  const getFileName = (fieldName) => {
    return uploadedFiles[fieldName]?.name || '';
  };

  const getUploadStatus = (fieldName) => {
    return uploadStatus[fieldName];
  };

  const renderFileField = (field) => {
    const status = getUploadStatus(field.name);
    const fileName = getFileName(field.name);

    return (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* File input display */}
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-gray-50 mb-2">
            <input
                type="text"
                id={field.name}
                value={fileName}
                placeholder={applicationDocumentsConfig.messages.noFileSelected}
                readOnly
                className="flex-grow bg-transparent outline-none text-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={() => handleFileUpload(field)}
                className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Browse
            </button>
          </div>

          {/* Upload status */}
          {status && (
              <p className={`text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {status.message}
              </p>
          )}
        </div>
    );
  };

  const renderCategory = (category) => {
    return (
        <div key={category.title}>
          <h3 className="text-lg font-medium text-gray-700 mb-2">{category.title}</h3>
          <div className="flex space-x-4">
            {category.fields.map(field => (
                <div key={field.id} className="flex-1">
                  {renderFileField(field)}
                </div>
            ))}
          </div>
        </div>
    );
  };

  const renderSection = (section) => {
    return (
        <div key={section.title} className="mb-8">
          <div className="grid grid-cols-1 md:grid-rows-2 lg:grid-rows-2 gap-8 mb-8">
            {section.categories.map(category => renderCategory(category))}
          </div>
        </div>
    );
  };

  // Calculate completion status
  const getRequiredFields = () => {
    const requiredFields = [];
    applicationDocumentsConfig.sections.forEach(section => {
      section.categories.forEach(category => {
        category.fields.forEach(field => {
          if (field.required) {
            requiredFields.push(field.name);
          }
        });
      });
    });
    return requiredFields;
  };

  const getCompletionStatus = () => {
    const requiredFields = getRequiredFields();
    const uploadedRequired = requiredFields.filter(fieldName => uploadedFiles[fieldName]);
    return {
      completed: uploadedRequired.length,
      total: requiredFields.length,
      isComplete: uploadedRequired.length === requiredFields.length
    };
  };

  const completionStatus = getCompletionStatus();

  return (
      <div>
        <div>
          <main>
            <div>
              {/* Step Navigation */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4 sm:space-x-8 gap-4">
                  {steps.map((step, index) => (
                      <div key={step.name} className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                            index < 2 ? 'bg-green-500' : index === 2 ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          {typeof step.icon === 'string' ? (
                              <img src={step.icon} alt="" width={30} height={30} />
                          ) : (
                              <img src={step.icon} alt="" width={30} height={30} />
                          )}
                        </div>
                        <span className={`font-medium text-sm ${
                            index < 2 ? 'text-green-500' : index === 2 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                      {step.name}
                    </span>
                        <div className={`w-25 h-1 mt-2 ${
                            index < 2 ? 'bg-green-500' : index === 2 ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-gray-400 text-xs mt-1">Step {index + 1}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Main page heading */}
              <div className="mb-6 border-b-2 pb-2 border-gray-300">
                <h1 className="text-3xl font-bold text-[#0433A9] flex items-center">
                  <img src={BlueDocu} alt="Document Icon" className="w-6 h-6 mr-2" />
                  Upload Documentary Requirements
                </h1>
              </div>

              {/* Form Content Area */}
              <div className="flex-1 flex flex-col">
                {/*/!* Progress indicator *!/*/}
                {/*<div className="mb-6 p-4 bg-blue-50 rounded-lg">*/}
                {/*  <div className="flex items-center justify-between mb-2">*/}
                {/*  <span className="text-sm font-medium text-blue-900">*/}
                {/*    Upload Progress*/}
                {/*  </span>*/}
                {/*    <span className="text-sm text-blue-700">*/}
                {/*    {completionStatus.completed} of {completionStatus.total} required documents*/}
                {/*  </span>*/}
                {/*  </div>*/}
                {/*  <div className="w-full bg-blue-200 rounded-full h-2">*/}
                {/*    <div*/}
                {/*        className="bg-blue-600 h-2 rounded-full transition-all duration-300"*/}
                {/*        style={{ width: `${(completionStatus.completed / completionStatus.total) * 100}%` }}*/}
                {/*    ></div>*/}
                {/*  </div>*/}
                {/*</div>*/}

                {/* Render sections dynamically */}
                {applicationDocumentsConfig.sections.map(section => renderSection(section))}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-auto pt-6">
                  {/* Left - Back button */}
                  <div>
                    <button
                        className="px-6 py-2 text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                        onClick={onBack}
                    >
                      Back
                    </button>
                  </div>

                  {/* Right - Save & Proceed buttons */}
                  <div className="flex gap-4">
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={onProceed}
                    >
                      Save & Exit
                    </button>
                    <button
                        className={`px-6 py-2 rounded-md transition-colors ${
                            completionStatus.isComplete
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                        onClick={completionStatus.isComplete ? onProceed : undefined}
                        disabled={!completionStatus.isComplete}
                    >
                      Proceed
                    </button>
                  </div>
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
            title={currentField ? `Upload ${currentField.label}` : 'Upload File'}
        />
      </div>
  );
};

export default ApplicationDocuments;