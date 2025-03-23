import React, { useState } from "react";

const VendorProfileForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    logo: null,
    phone: "",
    email: "",
    address: "",
    services: [],
    portfolio: [],
  });

  const servicesList = ["Installation", "Maintenance", "Modernization", "Repair"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => {
      const updatedServices = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services: updatedServices };
    });
  };

  const handlePortfolioUpload = (e) => {
    setFormData({ ...formData, portfolio: [...e.target.files] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Vendor Profile Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input type="file" name="logo" onChange={handleFileChange} className="w-full p-2 border rounded" />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="address"
          placeholder="Company Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div className="space-y-2">
          <p className="font-medium">Services Offered:</p>
          {servicesList.map((service) => (
            <label key={service} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.services.includes(service)}
                onChange={() => handleServiceChange(service)}
              />
              {service}
            </label>
          ))}
        </div>

        <input type="file" multiple onChange={handlePortfolioUpload} className="w-full p-2 border rounded" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default VendorProfileForm;
