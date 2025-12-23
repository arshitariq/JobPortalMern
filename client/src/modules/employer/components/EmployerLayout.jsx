// src/modules/employer/components/JobForm.jsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const EmployerLayout = ({ 
  form = {}, // default empty object
  isEdit = false, 
  saving = false, 
  onChange = () => {}, 
  onToggleBenefit = () => {}, 
  onApplyModeChange = () => {}, 
  onSubmit = () => {} 
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(
    form.tags?.split(',').map(s => s.trim()).filter(Boolean) || []
  );

  const benefitOptions = [
    'Health Insurance', 'Dental Insurance', 'Vision Insurance', 
    '401(k) Matching', 'Stock Options', 'Annual Bonus',
    'Unlimited PTO', 'Paid Holidays', 'Parental Leave',
    'Professional Development', 'Conference Budget', 'Tuition Reimbursement',
    'Gym Membership', 'Wellness Stipend', 'Remote Work Options',
    'Flexible Hours', 'Home Office Stipend', 'Commuter Benefits'
  ];

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      onChange({ target: { name: 'tags', value: newSkills.join(', ') } });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    onChange({ target: { name: 'tags', value: newSkills.join(', ') } });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!form.title || !form.jobRole || !form.description) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      title: form.title?.trim() || '',
      jobRole: form.jobRole || '',
      skillsRequired: skills.length > 0 ? skills.map(s => ({ name: s, level: 'Intermediate' })) : [],
      responsibilities: [],
      qualifications: [],
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      salaryCurrency: form.salaryCurrency || 'USD',
      salaryType: form.salaryType || 'Yearly',
      employmentType: form.jobType || 'Full-time',
      experienceLevel: form.experience || 'Mid-Senior',
      educationLevel: form.education || 'Any',
      workLocationType: form.isRemote ? 'Remote' : 'On-site',
      address: form.isRemote ? {} : {
        city: form.city || '',
        country: form.country || '',
      },
      benefits: (form.benefits || []).map(b => ({ category: 'General', name: b })),
      applicationDeadline: form.expirationDate ? new Date(form.expirationDate).toISOString() : undefined,
      applicationProcess: form.applyMode === 'on_jobpilot' ? 'Easy Apply' :
                         form.applyMode === 'external_url' ? 'Company Website' :
                         form.applyMode === 'email' ? 'Email' : 'Easy Apply',
      applicationUrl: form.applyMode === 'external_url' ? form.externalUrl : undefined,
      applicationEmail: form.applyMode === 'email' ? form.applyEmail : undefined,
      description: form.description?.trim() || '',
      status: 'active'
    };

    console.log('Submitting job payload:', payload);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={form.title || ''}
              onChange={onChange}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Role *</label>
            <select
              name="jobRole"
              value={form.jobRole || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select role</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Mobile Developer">Mobile Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
            </select>
          </div>
          {/* Other fields are similarly safe with optional chaining */}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Required Skills</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill"
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* The rest of your sections (Location, Salary, Benefits, Description, Application Method, Submit) */}
      {/* Just make sure all accesses like form.city, form.benefits, form.description use optional chaining: form?.city || '' */}
    </form>
  );
};

export default EmployerLayout;
