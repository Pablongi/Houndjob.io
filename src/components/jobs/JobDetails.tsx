import React from 'react';
import { Job } from '../../types/job';

interface JobDetailsProps {
  jobs: Job[];
}

const JobDetails: React.FC<JobDetailsProps> = ({ jobs }) => {
  return <div>Job Details Placeholder</div>;
};

export default JobDetails;