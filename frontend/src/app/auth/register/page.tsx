// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Eye, EyeOff, CheckCircle } from 'lucide-react';
// import { useAuthStore } from '@/store/useAuthStore';
// import { UserRole, RegisterFormData, ValidationErrors } from '@/lib/types/auth.types';
// import { HospitalsApiService } from '@/lib/services/hospitals.service';
// import { HospitalRegistrationService, HospitalRegistrationData } from '@/lib/services/hospital-registration.service';

// export default function RegisterPage() {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<RegisterFormData>({
//     // Basic Info
//     role: UserRole.PATIENT,
//     email: '',
//     password: '',
//     confirmPassword: '',
//     firstName: '',
//     lastName: '',
//     phone: '',
    
//     // Patient specific
//     dateOfBirth: '',
//     gender: 'male',
//     address: '',
//     emergencyContactName: '',
//     emergencyContactPhone: '',
//     emergencyContactRelation: '',
    
//     // Doctor specific
//     licenseNumber: '',
//     specialization: '',
//     department: '',
//     hospitalId: '',
    
//     // Hospital Admin specific
//     hospitalName: '',
//     hospitalAddress: '',
//     hospitalCity: '',
//     hospitalState: '',
//     hospitalZipCode: '',
//     hospitalPhone: '',
//     hospitalLicense: '',
//     hospitalWebsite: '',
    
//     // Agreement
//     agreeToTerms: false,
//     agreeToPrivacy: false
//   });
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState<ValidationErrors>({});
//   const [hospitals, setHospitals] = useState<Array<{id: string; name: string; city: string; state: string; address: string}>>([]);
//   const [hospitalsLoading, setHospitalsLoading] = useState(false);

//   const { register, isLoading, error } = useAuthStore();
//   const router = useRouter();

//   // Fetch hospitals when user selects doctor or hospital admin role
//   useEffect(() => {
//     const fetchHospitals = async () => {
//       if (formData.role === UserRole.DOCTOR || formData.role === UserRole.HOSPITAL_ADMIN) {
//         setHospitalsLoading(true);
//         try {
//           const response = await HospitalsApiService.getHospitalsForRegistration({ limit: 100 });
//           setHospitals(response.hospitals);
//         } catch (error) {
//           console.error('Failed to fetch hospitals:', error);
//           // Set a default hospital option if fetch fails
//           setHospitals([{ id: 'other', name: 'Other (will verify later)', city: '', state: '', address: '' }]);
//         } finally {
//           setHospitalsLoading(false);
//         }
//       } else {
//         setHospitals([]); // Clear hospitals if not doctor or hospital admin role
//       }
//     };

//     fetchHospitals();
//   }, [formData.role]);

//   const validateStep1 = (): boolean => {
//     const newErrors: ValidationErrors = {};

//     if (!formData.email) newErrors.email = 'Email is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
//     if (!formData.firstName) newErrors.firstName = 'First name is required';
//     if (!formData.lastName) newErrors.lastName = 'Last name is required';
//     if (!formData.phone) newErrors.phone = 'Phone is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = (): boolean => {
//     const newErrors: ValidationErrors = {};

//     if (formData.role === UserRole.PATIENT) {
//       if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
//       if (!formData.address) newErrors.address = 'Address is required';
//       if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
//       if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
//     } else if (formData.role === UserRole.DOCTOR) {
//       if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
//       if (!formData.specialization) newErrors.specialization = 'Specialization is required';
//       if (!formData.department) newErrors.department = 'Department is required';
//     } else if (formData.role === UserRole.HOSPITAL_ADMIN) {
//       // Only require hospital details if creating a new hospital
//       if (!formData.hospitalId || formData.hospitalId === 'new') {
//         if (!formData.hospitalName) newErrors.hospitalName = 'Hospital name is required';
//         if (!formData.hospitalAddress) newErrors.hospitalAddress = 'Hospital address is required';
//         if (!formData.hospitalCity) newErrors.hospitalCity = 'Hospital city is required';
//         if (!formData.hospitalState) newErrors.hospitalState = 'Hospital state is required';
//         if (!formData.hospitalZipCode) newErrors.hospitalZipCode = 'Hospital ZIP code is required';
//         if (!formData.hospitalPhone) newErrors.hospitalPhone = 'Hospital phone is required';
//         if (!formData.hospitalLicense) newErrors.hospitalLicense = 'Hospital license is required';
//       }
//       // If joining existing hospital, hospitalId is already set from the dropdown
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = (): void => {
//     if (step === 1 && validateStep1()) {
//       setStep(2);
//     } else if (step === 2 && validateStep2()) {
//       setStep(3);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
//       setErrors({ agreement: 'You must agree to the terms and privacy policy' });
//       return;
//     }

//     try {
//       // If hospital admin is creating a new hospital, register the hospital first
//       let hospitalId = formData.hospitalId;
      
//       if (formData.role === UserRole.HOSPITAL_ADMIN && (!formData.hospitalId || formData.hospitalId === 'new')) {
//         // Validate required hospital fields
//         if (!formData.hospitalName || !formData.hospitalAddress || !formData.hospitalCity || 
//             !formData.hospitalState || !formData.hospitalZipCode || !formData.hospitalPhone || 
//             !formData.hospitalLicense) {
//           setErrors({ 
//             agreement: 'Hospital information is incomplete. Please fill in all required hospital fields.' 
//           });
//           return;
//         }

//         const hospitalData: HospitalRegistrationData = {
//           name: formData.hospitalName,
//           address: formData.hospitalAddress,
//           city: formData.hospitalCity || '',
//           state: formData.hospitalState || '',
//           zipCode: formData.hospitalZipCode || '',
//           email: formData.email, // Use admin email as hospital contact email
//           phone: formData.hospitalPhone,
//           website: formData.hospitalWebsite || undefined,
//           registrationNumber: formData.hospitalLicense,
//           adminDetails: {
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             email: formData.email,
//             phone: formData.phone,
//             title: 'Hospital Administrator',
//             password: formData.password  // Add the password field
//           },
//           departments: [], // You may want to add departments field to the form
//           facilities: [], // You may want to add facilities field to the form
//           notes: 'Hospital registered during admin registration process'
//         };

//         const hospitalResponse = await HospitalRegistrationService.registerHospital(hospitalData);
//         hospitalId = hospitalResponse.hospitalId;
        
//         // Hospital registration already creates the admin user account, so redirect to login
//         alert(`Hospital registration submitted successfully! 

// Your hospital registration is pending approval by the system administrator. You will receive an email notification once your request is reviewed.

// Important: Your account will be activated only after your hospital is approved. You won't be able to log in until the approval process is complete.`);
//         router.push('/auth/login?registered=true&hospital_pending=true');
//         return; // Exit early, don't proceed with user registration
//       }

//       // Only register user if NOT a hospital admin creating a new hospital
//       const registerData = {
//         email: formData.email,
//         password: formData.password,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         role: formData.role,
//         ...(formData.role === UserRole.DOCTOR && hospitalId && { hospitalId }),
//         ...(formData.role === UserRole.HOSPITAL_ADMIN && hospitalId && { hospitalId }),
//       };

//       const result = await register(registerData);
      
//       if (result.success) {
//         // Normal registration
//         router.push('/auth/login?registered=true');
//       }
//     } catch (error: any) {
//       console.error('Registration error:', error);
//       setErrors({ 
//         agreement: error.message || 'Registration failed. Please try again.' 
//       });
//     }
//   };

//   const renderStep1 = () => (
//     <div className="space-y-6">
//       <div>
//         <label htmlFor="role" className="block text-sm font-medium text-gray-700">
//           I am registering as a
//         </label>
//         <select
//           id="role"
//           name="role"
//           value={formData.role}
//           onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
//           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//         >
//           <option value={UserRole.PATIENT}>Patient</option>
//           <option value={UserRole.DOCTOR}>Doctor</option>
//           <option value={UserRole.HOSPITAL_ADMIN}>Hospital Administrator</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//             First Name
//           </label>
//           <input
//             id="firstName"
//             name="firstName"
//             type="text"
//             required
//             value={formData.firstName}
//             onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//             className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//               errors.firstName ? 'border-red-300' : 'border-gray-300'
//             }`}
//             placeholder="Enter your first name"
//           />
//           {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
//         </div>

//         <div>
//           <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//             Last Name
//           </label>
//           <input
//             id="lastName"
//             name="lastName"
//             type="text"
//             required
//             value={formData.lastName}
//             onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//             className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//               errors.lastName ? 'border-red-300' : 'border-gray-300'
//             }`}
//             placeholder="Enter your last name"
//           />
//           {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
//         </div>
//       </div>

//       <div>
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//           Email Address
//         </label>
//         <input
//           id="email"
//           name="email"
//           type="email"
//           required
//           value={formData.email}
//           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//             errors.email ? 'border-red-300' : 'border-gray-300'
//           }`}
//           placeholder="Enter your email"
//         />
//         {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//       </div>

//       <div>
//         <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//           Phone Number
//         </label>
//         <input
//           id="phone"
//           name="phone"
//           type="tel"
//           required
//           value={formData.phone}
//           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//           className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//             errors.phone ? 'border-red-300' : 'border-gray-300'
//           }`}
//           placeholder="Enter your phone number"
//         />
//         {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
//       </div>

//       <div>
//         <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//           Password
//         </label>
//         <div className="mt-1 relative">
//           <input
//             id="password"
//             name="password"
//             type={showPassword ? 'text' : 'password'}
//             required
//             value={formData.password}
//             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//             className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//               errors.password ? 'border-red-300' : 'border-gray-300'
//             }`}
//             placeholder="Create a password"
//           />
//           <button
//             type="button"
//             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? (
//               <EyeOff className="h-5 w-5 text-gray-400" />
//             ) : (
//               <Eye className="h-5 w-5 text-gray-400" />
//             )}
//           </button>
//         </div>
//         {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
//       </div>

//       <div>
//         <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
//           Confirm Password
//         </label>
//         <div className="mt-1 relative">
//           <input
//             id="confirmPassword"
//             name="confirmPassword"
//             type={showConfirmPassword ? 'text' : 'password'}
//             required
//             value={formData.confirmPassword}
//             onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//             className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//               errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
//             }`}
//             placeholder="Confirm your password"
//           />
//           <button
//             type="button"
//             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             {showConfirmPassword ? (
//               <EyeOff className="h-5 w-5 text-gray-400" />
//             ) : (
//               <Eye className="h-5 w-5 text-gray-400" />
//             )}
//           </button>
//         </div>
//         {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
//       </div>

//       <button
//         type="button"
//         onClick={handleNext}
//         className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//       >
//         Continue
//       </button>
//     </div>
//   );

//   const renderStep2 = () => (
//     <div className="space-y-6">
//       {formData.role === UserRole.PATIENT && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
//                 Date of Birth
//               </label>
//               <input
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 type="date"
//                 required
//                 value={formData.dateOfBirth}
//                 onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
//                 }`}
//               />
//               {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
//             </div>

//             <div>
//               <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
//                 Gender
//               </label>
//               <select
//                 id="gender"
//                 name="gender"
//                 value={formData.gender}
//                 onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//               Address
//             </label>
//             <textarea
//               id="address"
//               name="address"
//               required
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.address ? 'border-red-300' : 'border-gray-300'
//               }`}
//               rows={3}
//               placeholder="Enter your full address"
//             />
//             {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
//           </div>

//           <div className="border-t pt-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
//                   Name
//                 </label>
//                 <input
//                   id="emergencyContactName"
//                   name="emergencyContactName"
//                   type="text"
//                   required
//                   value={formData.emergencyContactName}
//                   onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
//                   className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.emergencyContactName ? 'border-red-300' : 'border-gray-300'
//                   }`}
//                   placeholder="Emergency contact name"
//                 />
//                 {errors.emergencyContactName && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName}</p>}
//               </div>

//               <div>
//                 <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
//                   Phone
//                 </label>
//                 <input
//                   id="emergencyContactPhone"
//                   name="emergencyContactPhone"
//                   type="tel"
//                   required
//                   value={formData.emergencyContactPhone}
//                   onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
//                   className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                     errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'
//                   }`}
//                   placeholder="Emergency contact phone"
//                 />
//                 {errors.emergencyContactPhone && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>}
//               </div>
//             </div>

//             <div className="mt-4">
//               <label htmlFor="emergencyContactRelation" className="block text-sm font-medium text-gray-700">
//                 Relationship
//               </label>
//               <select
//                 id="emergencyContactRelation"
//                 name="emergencyContactRelation"
//                 value={formData.emergencyContactRelation}
//                 onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Select relationship</option>
//                 <option value="spouse">Spouse</option>
//                 <option value="parent">Parent</option>
//                 <option value="child">Child</option>
//                 <option value="sibling">Sibling</option>
//                 <option value="friend">Friend</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//           </div>
//         </>
//       )}

//       {formData.role === UserRole.DOCTOR && (
//         <>
//           <div>
//             <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
//               Medical License Number
//             </label>
//             <input
//               id="licenseNumber"
//               name="licenseNumber"
//               type="text"
//               required
//               value={formData.licenseNumber}
//               onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter your license number"
//             />
//             {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
//           </div>

//           <div>
//             <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
//               Specialization
//             </label>
//             <select
//               id="specialization"
//               name="specialization"
//               value={formData.specialization}
//               onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.specialization ? 'border-red-300' : 'border-gray-300'
//               }`}
//             >
//               <option value="">Select specialization</option>
//               <option value="cardiology">Cardiology</option>
//               <option value="neurology">Neurology</option>
//               <option value="orthopedics">Orthopedics</option>
//               <option value="pediatrics">Pediatrics</option>
//               <option value="emergency">Emergency Medicine</option>
//               <option value="general">General Practice</option>
//               <option value="other">Other</option>
//             </select>
//             {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
//           </div>

//           <div>
//             <label htmlFor="department" className="block text-sm font-medium text-gray-700">
//               Department
//             </label>
//             <input
//               id="department"
//               name="department"
//               type="text"
//               required
//               value={formData.department}
//               onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.department ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter your department"
//             />
//             {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
//           </div>

//           <div>
//             <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">
//               Hospital/Institution
//             </label>
//             <select
//               id="hospitalId"
//               name="hospitalId"
//               value={formData.hospitalId}
//               onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
//               disabled={hospitalsLoading}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <option value="">
//                 {hospitalsLoading ? 'Loading hospitals...' : 'Select hospital'}
//               </option>
//               {hospitals.map((hospital) => (
//                 <option key={hospital.id} value={hospital.id}>
//                   {hospital.name} {hospital.city && `- ${hospital.city}`} {hospital.state && `, ${hospital.state}`}
//                 </option>
//               ))}
//               <option value="other">Other (will verify later)</option>
//             </select>
//             {hospitalsLoading && (
//               <p className="mt-1 text-sm text-blue-600">Loading available hospitals...</p>
//             )}
//           </div>
//         </>
//       )}

//       {formData.role === UserRole.HOSPITAL_ADMIN && (
//         <>
//           <div>
//             <label htmlFor="hospitalSelection" className="block text-sm font-medium text-gray-700">
//               Hospital Selection
//             </label>
//             <select
//               id="hospitalSelection"
//               name="hospitalSelection"
//               value={formData.hospitalId || 'new'}
//               onChange={(e) => setFormData({ 
//                 ...formData, 
//                 hospitalId: e.target.value === 'new' ? '' : e.target.value 
//               })}
//               disabled={hospitalsLoading}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <option value="new">
//                 {hospitalsLoading ? 'Loading hospitals...' : 'Create New Hospital'}
//               </option>
//               {hospitals.map((hospital) => (
//                 <option key={hospital.id} value={hospital.id}>
//                   Join existing: {hospital.name} {hospital.city && `- ${hospital.city}`} {hospital.state && `, ${hospital.state}`}
//                 </option>
//               ))}
//             </select>
//             {hospitalsLoading && (
//               <p className="mt-1 text-sm text-blue-600">Loading available hospitals...</p>
//             )}
//             <p className="mt-1 text-sm text-gray-500">
//               Select "Create New Hospital" to register a new hospital, or choose an existing hospital to join as admin.
//             </p>
//           </div>

//           {/* Show hospital creation fields only if "Create New Hospital" is selected */}
//           {(!formData.hospitalId || formData.hospitalId === 'new') && (
//             <>
//               <div className="border-t pt-4">
//                 <h4 className="text-md font-medium text-gray-900 mb-4">New Hospital Details</h4>
//           <div>
//             <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
//               Hospital Name
//             </label>
//             <input
//               id="hospitalName"
//               name="hospitalName"
//               type="text"
//               required
//               value={formData.hospitalName}
//               onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.hospitalName ? 'border-red-300' : 'border-gray-300'
//               }`}
//               placeholder="Enter hospital name"
//             />
//             {errors.hospitalName && <p className="mt-1 text-sm text-red-600">{errors.hospitalName}</p>}
//           </div>

//           <div>
//             <label htmlFor="hospitalAddress" className="block text-sm font-medium text-gray-700">
//               Hospital Address
//             </label>
//             <textarea
//               id="hospitalAddress"
//               name="hospitalAddress"
//               required
//               value={formData.hospitalAddress}
//               onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
//               className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                 errors.hospitalAddress ? 'border-red-300' : 'border-gray-300'
//               }`}
//               rows={3}
//               placeholder="Enter hospital address"
//             />
//             {errors.hospitalAddress && <p className="mt-1 text-sm text-red-600">{errors.hospitalAddress}</p>}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label htmlFor="hospitalCity" className="block text-sm font-medium text-gray-700">
//                 City
//               </label>
//               <input
//                 id="hospitalCity"
//                 name="hospitalCity"
//                 type="text"
//                 required
//                 value={formData.hospitalCity}
//                 onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.hospitalCity ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="City"
//               />
//               {errors.hospitalCity && <p className="mt-1 text-sm text-red-600">{errors.hospitalCity}</p>}
//             </div>

//             <div>
//               <label htmlFor="hospitalState" className="block text-sm font-medium text-gray-700">
//                 State
//               </label>
//               <input
//                 id="hospitalState"
//                 name="hospitalState"
//                 type="text"
//                 required
//                 value={formData.hospitalState}
//                 onChange={(e) => setFormData({ ...formData, hospitalState: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.hospitalState ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="State"
//               />
//               {errors.hospitalState && <p className="mt-1 text-sm text-red-600">{errors.hospitalState}</p>}
//             </div>

//             <div>
//               <label htmlFor="hospitalZipCode" className="block text-sm font-medium text-gray-700">
//                 ZIP Code
//               </label>
//               <input
//                 id="hospitalZipCode"
//                 name="hospitalZipCode"
//                 type="text"
//                 required
//                 value={formData.hospitalZipCode}
//                 onChange={(e) => setFormData({ ...formData, hospitalZipCode: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.hospitalZipCode ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="ZIP Code"
//               />
//               {errors.hospitalZipCode && <p className="mt-1 text-sm text-red-600">{errors.hospitalZipCode}</p>}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="hospitalPhone" className="block text-sm font-medium text-gray-700">
//                 Hospital Phone
//               </label>
//               <input
//                 id="hospitalPhone"
//                 name="hospitalPhone"
//                 type="tel"
//                 required
//                 value={formData.hospitalPhone}
//                 onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.hospitalPhone ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="Hospital phone number"
//               />
//               {errors.hospitalPhone && <p className="mt-1 text-sm text-red-600">{errors.hospitalPhone}</p>}
//             </div>

//             <div>
//               <label htmlFor="hospitalLicense" className="block text-sm font-medium text-gray-700">
//                 Hospital License
//               </label>
//               <input
//                 id="hospitalLicense"
//                 name="hospitalLicense"
//                 type="text"
//                 required
//                 value={formData.hospitalLicense}
//                 onChange={(e) => setFormData({ ...formData, hospitalLicense: e.target.value })}
//                 className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
//                   errors.hospitalLicense ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="Hospital license number"
//               />
//               {errors.hospitalLicense && <p className="mt-1 text-sm text-red-600">{errors.hospitalLicense}</p>}
//             </div>

//             <div>
//               <label htmlFor="hospitalWebsite" className="block text-sm font-medium text-gray-700">
//                 Website (Optional)
//               </label>
//               <input
//                 id="hospitalWebsite"
//                 name="hospitalWebsite"
//                 type="url"
//                 value={formData.hospitalWebsite}
//                 onChange={(e) => setFormData({ ...formData, hospitalWebsite: e.target.value })}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="https://www.hospital.com"
//               />
//             </div>
//           </div>
//               </div>
//             </>
//           )}
//         </>
//       )}

//       <div className="flex space-x-4">
//         <button
//           type="button"
//           onClick={() => setStep(1)}
//           className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Back
//         </button>
//         <button
//           type="button"
//           onClick={handleNext}
//           className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );

//   const renderStep3 = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
//         <h3 className="mt-4 text-lg font-medium text-gray-900">Almost Done!</h3>
//         <p className="mt-2 text-sm text-gray-600">
//           Please review the terms and complete your registration.
//         </p>
//       </div>

//       <div className="bg-gray-50 p-4 rounded-lg">
//         <h4 className="font-medium text-gray-900 mb-2">Registration Summary</h4>
//         <div className="text-sm text-gray-600 space-y-1">
//           <p><span className="font-medium">Role:</span> {formData.role.replace('_', ' ').toUpperCase()}</p>
//           <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
//           <p><span className="font-medium">Email:</span> {formData.email}</p>
//           <p><span className="font-medium">Phone:</span> {formData.phone}</p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div className="flex items-start">
//           <input
//             id="agreeToTerms"
//             name="agreeToTerms"
//             type="checkbox"
//             checked={formData.agreeToTerms}
//             onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
//             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
//           />
//           <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
//             I agree to the{' '}
//             <Link href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
//               Terms of Service
//             </Link>
//           </label>
//         </div>

//         <div className="flex items-start">
//           <input
//             id="agreeToPrivacy"
//             name="agreeToPrivacy"
//             type="checkbox"
//             checked={formData.agreeToPrivacy}
//             onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
//             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
//           />
//           <label htmlFor="agreeToPrivacy" className="ml-2 block text-sm text-gray-900">
//             I agree to the{' '}
//             <Link href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
//               Privacy Policy
//             </Link>
//           </label>
//         </div>
//       </div>

//       {errors.agreement && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-3">
//           <p className="text-sm text-red-600">{errors.agreement}</p>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-md p-3">
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}

//       <div className="flex space-x-4">
//         <button
//           type="button"
//           onClick={() => setStep(2)}
//           className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Back
//         </button>
//         <button
//           type="submit"
//           disabled={isLoading || !formData.agreeToTerms || !formData.agreeToPrivacy}
//           className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading ? 'Creating Account...' : 'Create Account'}
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl w-full space-y-8">
//         <div>
//           <div className="flex justify-center">
//             <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">M</span>
//             </div>
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Join MediChain.AI
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Already have an account?{' '}
//             <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
//               Sign in here
//             </Link>
//             {' '} | {' '}
//             <Link href="/auth/register-ssi" className="font-medium text-blue-600 hover:text-blue-500">
//               Register with Government Proofs
//             </Link>
//           </p>
//         </div>

//         {/* Progress Indicator */}
//         <div className="flex items-center justify-center space-x-4">
//           {[1, 2, 3].map((stepNumber) => (
//             <div key={stepNumber} className="flex items-center">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
//                   step >= stepNumber
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-200 text-gray-500'
//                 }`}
//               >
//                 {stepNumber}
//               </div>
//               {stepNumber < 3 && (
//                 <div
//                   className={`w-12 h-1 ${
//                     step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
//                   }`}
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
//           <form onSubmit={handleSubmit}>
//             {step === 1 && renderStep1()}
//             {step === 2 && renderStep2()}
//             {step === 3 && renderStep3()}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Upload, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types/auth.types';

// SSI Types
interface ProofMetadata {
  issuer: string;
  issuedDate: string;
  expirationDate?: string;
  documentNumber: string;
  holderName?: string;
  holderDOB?: string;
  additionalFields?: Record<string, any>;
}

interface DigitalSignature {
  signature: string;
  algorithm: string;
  publicKey: string;
  timestamp: string;
}

interface ProofSubmission {
  type: ProofType;
  document: string; // Base64 encoded
  metadata: ProofMetadata;
  signature?: DigitalSignature;
}

enum ProofType {
  GOVERNMENT_ID = 'government_id',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  AADHAAR = 'aadhaar',
  VOTER_ID = 'voter_id',
  PAN_CARD = 'pan_card',
  MEDICAL_LICENSE = 'medical_license',
  EDUCATION_CERTIFICATE = 'education_certificate',
  PROFESSIONAL_LICENSE = 'professional_license',
  HOSPITAL_AFFILIATION = 'hospital_affiliation',
  OTHER = 'other',
}

interface SSIFormData {
  // Basic Info
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  walletAddress?: string;
  hospitalId?: string;
  password?: string;
  
  // Government Proofs
  proofs: ProofSubmission[];
  
  // Agreement
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToSSI: boolean;
}

const PROOF_DESCRIPTIONS = {
  [ProofType.GOVERNMENT_ID]: 'Any government-issued identity document',
  [ProofType.PASSPORT]: 'International passport document',
  [ProofType.DRIVING_LICENSE]: 'Valid driving license',
  [ProofType.AADHAAR]: 'Aadhaar card (India)',
  [ProofType.VOTER_ID]: 'Voter identification card',
  [ProofType.PAN_CARD]: 'Permanent Account Number card (India)',
  [ProofType.MEDICAL_LICENSE]: 'Medical practice license',
  [ProofType.EDUCATION_CERTIFICATE]: 'Educational qualification certificate',
  [ProofType.PROFESSIONAL_LICENSE]: 'Professional certification or license',
  [ProofType.HOSPITAL_AFFILIATION]: 'Hospital employment or affiliation proof',
  [ProofType.OTHER]: 'Other verifiable credentials',
};

const ROLE_REQUIREMENTS = {
  [UserRole.PATIENT]: [], // No required proofs for patients - optional SSI
  [UserRole.DOCTOR]: [ProofType.AADHAAR, ProofType.MEDICAL_LICENSE],
  [UserRole.HOSPITAL_ADMIN]: [ProofType.AADHAAR, ProofType.PROFESSIONAL_LICENSE],
  [UserRole.SYSTEM_ADMIN]: [ProofType.AADHAAR, ProofType.PROFESSIONAL_LICENSE],
};

const ROLE_OPTIONAL_PROOFS = {
  [UserRole.PATIENT]: [ProofType.AADHAAR], // Only Aadhaar for patients
  [UserRole.DOCTOR]: [ProofType.EDUCATION_CERTIFICATE, ProofType.HOSPITAL_AFFILIATION],
  [UserRole.HOSPITAL_ADMIN]: [ProofType.HOSPITAL_AFFILIATION],
  [UserRole.SYSTEM_ADMIN]: [],
};

export default function SSIRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SSIFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.PATIENT,
    proofs: [],
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToSSI: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const router = useRouter();

  const handleFileUpload = useCallback(async (
    file: File, 
    proofType: ProofType, 
    metadata: ProofMetadata
  ) => {
    setUploadingProof(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      // Create proof submission
      const proof: ProofSubmission = {
        type: proofType,
        document: base64,
        metadata: {
          ...metadata,
          additionalFields: {
            ...metadata.additionalFields,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        },
      };

      // Add to proofs array
      setFormData(prev => ({
        ...prev,
        proofs: [...prev.proofs.filter(p => p.type !== proofType), proof]
      }));

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`proof_${proofType}`];
        return newErrors;
      });

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`proof_${proofType}`]: 'Failed to upload document'
      }));
    } finally {
      setUploadingProof(false);
    }
  }, []);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    // Only require password if not using wallet
    if (!formData.walletAddress && !formData.password) {
      newErrors.password = 'Password is required (or connect wallet)';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredProofs = ROLE_REQUIREMENTS[formData.role];
    const submittedProofTypes = formData.proofs.map(p => p.type);

    // Check if all required proofs are submitted (only for non-patient roles)
    if (requiredProofs.length > 0) {
      const missingProofs = requiredProofs.filter(type => !submittedProofTypes.includes(type));
      
      if (missingProofs.length > 0) {
        newErrors.proofs = `Missing required proofs: ${missingProofs.map(type => 
          PROOF_DESCRIPTIONS[type]).join(', ')}`;
      }
    }

    // For patients, proofs are optional, so just show a info message if none provided
    if (formData.role === UserRole.PATIENT && formData.proofs.length === 0) {
      // This is okay - patients can register without proofs
      console.log('Patient registering without SSI proofs - this is allowed');
    }

    // Validate each proof has required metadata
    formData.proofs.forEach(proof => {
      if (!proof.metadata.issuer) {
        newErrors[`proof_${proof.type}_issuer`] = 'Issuer is required';
      }
      if (!proof.metadata.documentNumber) {
        newErrors[`proof_${proof.type}_number`] = 'Document number is required';
      }
      if (!proof.metadata.issuedDate) {
        newErrors[`proof_${proof.type}_date`] = 'Issue date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.agreeToTerms || !formData.agreeToPrivacy || !formData.agreeToSSI) {
      setErrors({ agreement: 'You must agree to all terms and policies' });
      return;
    }

    setIsLoading(true);
    try {
      // For patients with no proofs, use regular registration, otherwise use SSI registration
      const endpoint = (formData.role === UserRole.PATIENT && formData.proofs.length === 0) 
        ? '/api/auth/register' // Use regular registration API if no proofs
        : '/api/auth/government-proofs/register'; // Use SSI registration API

      const requestBody = (formData.role === UserRole.PATIENT && formData.proofs.length === 0) 
        ? {
            // Regular registration payload
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            password: formData.password,
            walletAddress: formData.walletAddress,
            hospitalId: formData.hospitalId,
          }
        : {
            // SSI registration payload
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            governmentProofs: formData.proofs,
            walletAddress: formData.walletAddress,
            hospitalId: formData.hospitalId,
            password: formData.password,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Show appropriate success message
      if (formData.role === UserRole.PATIENT && formData.proofs.length === 0) {
        alert(`Registration successful!

✅ User ID: ${data.userId || 'Generated'}
✅ Registration Type: Standard (with SSI capability)

Your account has been created successfully. You can add government proofs later from your profile to enable enhanced blockchain verification.

Welcome to MediChain.AI!`);
        
        router.push('/auth/login?registered=standard');
      } else {
        alert(`Registration successful with Self Sovereign Identity!

✅ User ID: ${data.userId}
✅ Credentials submitted: ${data.credentialsCount}
✅ Credential IDs: ${data.credentialIds?.slice(0, 2).join(', ')}${data.credentialIds?.length > 2 ? '...' : ''}

Your government-issued proofs are now stored securely with blockchain verification. You will receive email notifications once your credentials are verified by authorized personnel.

${data.supportedProofs ? `Supported proof types include: ${data.supportedProofs.slice(0, 5).join(', ')} and more.` : ''}`);

        router.push('/auth/login?registered=ssi&verified=pending');
      }
    } catch (error: any) {
      console.error('SSI Registration error:', error);
      setErrors({ 
        agreement: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Self Sovereign Identity Registration</h3>
        <p className="mt-2 text-sm text-gray-600">
          Secure registration with government-issued proof verification
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Enhanced Security & Privacy
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your documents are encrypted and stored securely</li>
                <li>Blockchain-based verification ensures authenticity</li>
                <li>You maintain full control over your identity data</li>
                <li>Supports multiple government-issued proofs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          I am registering as a
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={UserRole.PATIENT}>Patient</option>
          <option value={UserRole.DOCTOR}>Doctor</option>
          <option value={UserRole.HOSPITAL_ADMIN}>Hospital Administrator</option>
        </select>
        
        {/* Show required proofs for selected role */}
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          {formData.role === UserRole.PATIENT ? (
            <div>
              <p className="text-sm font-medium text-gray-700">For {formData.role}s:</p>
              <ul className="mt-1 text-sm text-gray-600 list-disc pl-5">
                <li>No documents required - register instantly</li>
                <li>Optional: Upload Aadhaar card for enhanced security</li>
                <li>Benefit: Blockchain-verified identity and medical records</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">Required proofs for {formData.role}:</p>
              <ul className="mt-1 text-sm text-gray-600 list-disc pl-5">
                {ROLE_REQUIREMENTS[formData.role].map(proofType => (
                  <li key={proofType}>{PROOF_DESCRIPTIONS[proofType]}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-blue-600">
                * We only accept Aadhaar card for identity verification
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
          Wallet Address (Optional)
        </label>
        <input
          id="walletAddress"
          type="text"
          value={formData.walletAddress || ''}
          onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="0x... (for blockchain identity verification)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Connect your wallet for enhanced blockchain identity verification
        </p>
      </div>

      {!formData.walletAddress && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Create a secure password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => validateStep1() && setStep(2)}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Continue to Document Upload
      </button>
    </div>
  );

  const renderProofUpload = (proofType: ProofType, isRequired: boolean) => {
    const existingProof = formData.proofs.find(p => p.type === proofType);
    
    return (
      <div key={proofType} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {PROOF_DESCRIPTIONS[proofType]}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </h4>
              {existingProof ? (
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Document uploaded</span>
                </div>
              ) : isRequired ? (
                <div className="flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">Required document</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Optional document</span>
              )}
            </div>
          </div>
        </div>

        {!existingProof ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Issuing Authority"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onBlur={(e) => {
                  if (e.target.value) {
                    const metadata = { 
                      issuer: e.target.value,
                      issuedDate: '',
                      documentNumber: '',
                    };
                    // Store temporarily for when file is uploaded
                    e.target.dataset.metadata = JSON.stringify(metadata);
                  }
                }}
              />
              <input
                type="text"
                placeholder="Document Number"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onBlur={(e) => {
                  const issuerInput = e.target.parentElement?.querySelector('input[placeholder="Issuing Authority"]') as HTMLInputElement;
                  if (e.target.value && issuerInput?.value) {
                    const metadata = { 
                      issuer: issuerInput.value,
                      issuedDate: '',
                      documentNumber: e.target.value,
                    };
                    e.target.dataset.metadata = JSON.stringify(metadata);
                  }
                }}
              />
            </div>
            
            <input
              type="date"
              placeholder="Issue Date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor={`file-${proofType}`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload Document
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </span>
                </label>
                <input
                  id={`file-${proofType}`}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const container = e.target.closest('.border.border-gray-200');
                      const issuerInput = container?.querySelector('input[placeholder="Issuing Authority"]') as HTMLInputElement;
                      const numberInput = container?.querySelector('input[placeholder="Document Number"]') as HTMLInputElement;
                      const dateInput = container?.querySelector('input[type="date"]') as HTMLInputElement;

                      if (!issuerInput?.value || !numberInput?.value || !dateInput?.value) {
                        alert('Please fill in all document details first');
                        return;
                      }

                      const metadata: ProofMetadata = {
                        issuer: issuerInput.value,
                        documentNumber: numberInput.value,
                        issuedDate: dateInput.value,
                      };

                      await handleFileUpload(file, proofType, metadata);
                    }
                  }}
                  disabled={uploadingProof}
                />
              </div>
              {uploadingProof && (
                <div className="mt-2">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100">
                    Uploading...
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Document Uploaded Successfully
                </p>
                <div className="mt-1 text-sm text-green-700">
                  <p>Issuer: {existingProof.metadata.issuer}</p>
                  <p>Document: {existingProof.metadata.documentNumber}</p>
                  <p>Issue Date: {existingProof.metadata.issuedDate}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  proofs: prev.proofs.filter(p => p.type !== proofType)
                }));
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove document
            </button>
          </div>
        )}

        {errors[`proof_${proofType}`] && (
          <p className="mt-2 text-sm text-red-600">{errors[`proof_${proofType}`]}</p>
        )}
      </div>
    );
  };

  const renderStep2 = () => {
    const requiredProofs = ROLE_REQUIREMENTS[formData.role];
    const optionalProofs = ROLE_OPTIONAL_PROOFS[formData.role];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-blue-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Aadhaar Card</h3>
          {formData.role === UserRole.PATIENT ? (
            <p className="mt-2 text-sm text-gray-600">
              Upload your Aadhaar card for enhanced security (optional for patients)
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Upload your Aadhaar card and professional documents for identity verification
            </p>
          )}
        </div>

        {errors.proofs && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.proofs}</p>
          </div>
        )}

        {/* For patients, show info about optional nature */}
        {formData.role === UserRole.PATIENT && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Enhanced Security (Optional)
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>As a patient, you can register with or without your Aadhaar card:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>With Aadhaar:</strong> Enhanced security and blockchain verification</li>
                    <li><strong>Without Aadhaar:</strong> Standard registration with email verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Required proofs first */}
          {requiredProofs.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Required Documents</h4>
              <div className="space-y-4">
                {requiredProofs.map(proofType => 
                  renderProofUpload(proofType, true)
                )}
              </div>
            </div>
          )}

          {/* Optional proofs */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {formData.role === UserRole.PATIENT ? 'Optional Documents (Aadhaar Card for enhanced security)' : 'Additional Documents (Optional)'}
            </h4>
            <div className="space-y-4">
              {optionalProofs.slice(0, 4).map(proofType => 
                renderProofUpload(proofType, false)
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => validateStep2() && setStep(3)}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Review & Submit
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Review Your Registration</h3>
        <p className="mt-2 text-sm text-gray-600">
          Please review your information and complete your Self Sovereign Identity registration.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Registration Summary</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><span className="font-medium">Role:</span> {formData.role.replace('_', ' ').toUpperCase()}</p>
          <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
          <p><span className="font-medium">Email:</span> {formData.email}</p>
          {formData.walletAddress && (
            <p><span className="font-medium">Wallet:</span> {formData.walletAddress.slice(0, 10)}...</p>
          )}
          <p><span className="font-medium">Documents Uploaded:</span> {formData.proofs.length}</p>
          
          <div className="mt-3">
            <p className="font-medium">Uploaded Proofs:</p>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              {formData.proofs.map(proof => (
                <li key={proof.type}>
                  {PROOF_DESCRIPTIONS[proof.type]} - {proof.metadata.issuer}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
              Terms of Service
            </Link>
          </label>
        </div>

        <div className="flex items-start">
          <input
            id="agreeToPrivacy"
            type="checkbox"
            checked={formData.agreeToPrivacy}
            onChange={(e) => setFormData({ ...formData, agreeToPrivacy: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agreeToPrivacy" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="flex items-start">
          <input
            id="agreeToSSI"
            type="checkbox"
            checked={formData.agreeToSSI}
            onChange={(e) => setFormData({ ...formData, agreeToSSI: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="agreeToSSI" className="ml-2 block text-sm text-gray-900">
            I consent to Self Sovereign Identity verification and blockchain storage of my 
            document proofs. I understand my data is encrypted and I maintain control over access.
          </label>
        </div>
      </div>

      {errors.agreement && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.agreement}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              What happens next?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Your documents are encrypted and stored securely</li>
                <li>Credentials are registered on the blockchain</li>
                <li>Verification process begins with authorized personnel</li>
                <li>You'll receive email updates on verification status</li>
                <li>Your account will be activated once verification is complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms || !formData.agreeToPrivacy || !formData.agreeToSSI}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating SSI Account...' : 'Complete SSI Registration'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Self Sovereign Identity Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure registration with government proof verification |{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Use standard registration
            </Link>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </div>
      </div>
    </div>
  );
}