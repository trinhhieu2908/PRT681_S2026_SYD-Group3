# Week 1 – Initial Test Plan
## Job Finder App

**Role:** Data Analyst & Tester  
**Team Member:** Prince Kumar Sah

### Testing Objective
Define initial test scenarios for job search, filtering, job details and data validation.

| ID | Test Scenario | Expected Result | Priority |
|---|---|---|---|
| TC-001 | Search using a valid job title | Matching jobs are displayed | High |
| TC-002 | Search using a title with no results | Clear no-results message is displayed | Medium |
| TC-003 | Filter by location | Only jobs in the selected location are displayed | High |
| TC-004 | Filter by employment type | Only matching jobs are displayed | High |
| TC-005 | Filter by category | Only matching categories are displayed | Medium |
| TC-006 | Apply multiple filters | Results satisfy all selected filters | High |
| TC-007 | Open a job listing | Correct job details are displayed | High |
| TC-008 | Open application link | Correct application page opens | High |
| TC-009 | Job has missing optional salary | Listing remains usable | Medium |
| TC-010 | Duplicate job records exist | Duplicate is identified or prevented | Medium |

### Non-Functional Checks
- Search results should be clear and consistently formatted.
- Invalid data should not crash the application.
- Error messages should be understandable.
- Job information should remain consistent between list and detail views.

### Week 1 Deliverables
- Initial data dictionary
- Data-quality rules
- Initial test scenarios
- Sample testing dataset
