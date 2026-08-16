# Week 1 – Initial Data Dictionary
## Job Finder App

**Role:** Data Analyst & Tester  
**Team Member:** Prince Kumar Sah

### Core Job Data
| Field | Description | Example |
|---|---|---|
| job_id | Unique identifier | J001 |
| job_title | Position title | Software Developer |
| company | Hiring organisation | ABC Technology |
| location | Job location | Sydney, NSW |
| employment_type | Full-time, part-time, casual or contract | Full-time |
| salary_min | Minimum salary when available | 85000 |
| salary_max | Maximum salary when available | 105000 |
| category | Job category | Information Technology |
| description | Main job description | Develop and maintain software |
| skills | Required skills | Java, SQL, Git |
| posted_date | Date job was posted | 2026-08-10 |
| closing_date | Closing date if available | 2026-09-10 |
| source | Source of listing | Company Website |
| application_url | Application link | https://example.com/job/J001 |

### Initial Data Quality Rules
- `job_id` must be unique.
- `job_title` and `company` must not be empty.
- Salary values must be numeric when provided.
- `salary_min` must not be greater than `salary_max`.
- `posted_date` must be a valid date.
- Duplicate job records should be identified.
- Location and employment type should use consistent values.
- Application URLs should be valid links where available.

### Initial Analysis Goals
1. Identify data required for job searching and filtering.
2. Identify incomplete and duplicate job records.
3. Define consistent categories for employment type and job category.
4. Prepare data-quality rules that can be tested during development.
