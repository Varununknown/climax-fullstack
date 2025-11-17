import React from 'react';
import { X, FileText, Shield, RefreshCw } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Legal Information</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-8">
          
          {/* Terms and Conditions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Terms and Conditions</h3>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p className="font-semibold text-purple-300">This website is managed by VARUN H V</p>
                
                <p>
                  Any terms and conditions proposed by You which are in addition to or which conflict with these Terms of Use are expressly rejected by the Platform Owner and shall be of no force or effect. These Terms of Use can be modified at any time without assigning any reason. It is your responsibility to periodically review these Terms of Use to stay informed of updates.
                </p>
                
                <p>
                  For the purpose of these Terms of Use, wherever the context so requires "you", "your" or "user" shall mean any natural or legal person who has agreed to become a user/buyer on the Platform.
                </p>
                
                <p className="font-semibold text-yellow-300">
                  ACCESSING, BROWSING OR OTHERWISE USING THE PLATFORM INDICATES YOUR AGREEMENT TO ALL THE TERMS AND CONDITIONS UNDER THESE TERMS OF USE, SO PLEASE READ THE TERMS OF USE CAREFULLY BEFORE PROCEEDING.
                </p>
                
                <p>The use of Platform and/or availing of our Services is subject to the following Terms of Use:</p>
                
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account on the Platform.</li>
                  
                  <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose.</li>
                  
                  <li>You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                  
                  <li>Your use of our Services and the Platform is solely and entirely at your own risk and discretion for which we shall not be liable to you in any manner.</li>
                  
                  <li>You are required to independently assess and ensure that the Services meet your requirements.</li>
                  
                  <li>The contents of the Platform and the Services are proprietary to us and are licensed to us. You will not have any authority to claim any intellectual property rights, title, or interest in its contents.</li>
                  
                  <li>You acknowledge that unauthorized use of the Platform and/or the Services may lead to action against you as per these Terms of Use and/or applicable laws.</li>
                  
                  <li>You agree to pay us the charges associated with availing the Services.</li>
                  
                  <li>You agree not to use the Platform and/or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.</li>
                  
                  <li>You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites.</li>
                </ul>
                
                <p>
                  You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the Platform Owner for the Services.
                </p>
                
                <p>
                  You shall indemnify and hold harmless Platform Owner, its affiliates, group companies (as applicable) and their respective officers, directors, agents, and employees, from any claim or demand, or actions including reasonable attorneys' fees, made by any third party or penalty imposed due to or arising out of Your breach of this Terms of Use, privacy Policy and other Policies, or Your violation of any law, rules or regulations or the rights (including infringement of intellectual property rights) of a third party.
                </p>
                
                <p>
                  In no event will the Platform Owner be liable for any indirect, consequential, incidental, special or punitive damages, including without limitation damages for loss of profits or revenues, business interruption, loss of business opportunities, loss of data or loss of other economic interests, whether in contract, negligence, tort or otherwise, arising from the use of or inability to use the Services, however caused and whether arising in contract, tort, negligence, warranty or otherwise, exceed the amount paid by You for using the Services giving rise to the cause of action or Rupees One Hundred (Rs. 100) whichever is less.
                </p>
                
                <p>
                  Notwithstanding anything contained in these Terms of Use, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event.
                </p>
                
                <p>
                  These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India. All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in INDIA.
                </p>
                
                <p>
                  All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Policy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Privacy Policy</h3>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>
                  We retain your personal data information for a period no longer than is required for the purpose for which it was collected or as required under any applicable law. However, we may retain data related to you if we believe it may be necessary to prevent fraud or future abuse or for other legitimate purposes. We may continue to retain your data in anonymised form for analytical and research purposes.
                </p>
                
                <p>
                  <span className="font-semibold text-blue-300">Your Rights:</span> You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.
                </p>
                
                <p>
                  <span className="font-semibold text-blue-300">Consent:</span> By visiting our Platform or by providing your information, you consent to the collection, use, storage, disclosure and otherwise processing of your information on the Platform in accordance with this Privacy Policy. If you disclose to us any personal data relating to other people, you represent that you have the authority to do so and permit us to use the information in accordance with this Privacy Policy.
                </p>
                
                <p>
                  You, while providing your personal data over the Platform or any partner platforms or establishments, consent to us (including our other corporate entities, affiliates, lending partners, technology partners, marketing channels, business partners and other third parties) to contact you through SMS, instant messaging apps, call and/or e-mail for the purposes specified in this Privacy Policy.
                </p>
                
                <p>
                  You have an option to withdraw your consent that you have already provided by writing to the Grievance Officer at the contact information provided below. Please mention "Withdrawal of consent for processing personal data" in your subject line of your communication. We may verify such requests before acting on our request.
                </p>
                
                <p>
                  However, please note that your withdrawal of consent will not be retrospective and will be in accordance with the Terms of Use, this Privacy Policy, and applicable laws. In the event you withdraw consent given to us under this Privacy Policy, we reserve the right to restrict or deny the provision of our services for which we consider such information to be necessary.
                </p>
                
                <p>
                  <span className="font-semibold text-blue-300">Changes to this Privacy Policy:</span> Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices. We may alert/notify you about the significant changes to the Privacy Policy, in the manner as may be required under applicable laws.
                </p>
              </div>
            </div>
          </div>

          {/* Refund Policy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold text-white">Refund Policy</h3>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p className="font-semibold text-red-300">
                  Refund is not applicable once payment is made.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 bg-gray-800/30">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              Last updated: November 17, 2025
            </p>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;