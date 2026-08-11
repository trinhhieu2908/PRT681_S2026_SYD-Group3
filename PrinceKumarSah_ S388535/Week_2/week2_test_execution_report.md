# Week 2 – Initial Test Execution Report

**Team Member:** Prince Kumar Sah  
**Role:** Data Analyst & Tester

## Scope
The review covers the sample job dataset prepared in Week 1 and the initial
test scenarios for job search, filtering and job details.

## Data Quality Result
One potential duplicate was identified:

- **J001 – Software Developer – ABC Technology**
- **J004 – Software Developer – ABC Technology**

The two records contain the same key job information and should be flagged
for duplicate handling when the application data pipeline is implemented.

## Validation Result
The sample dataset passed the initial checks for:
- Required job title and company fields
- Salary minimum/maximum relationship
- Employment-type consistency
- Basic location formatting

## Testing Status
The detailed application test cases are currently marked **Not Executed**
because the application search/filter implementation is still under development.
They will be executed against the working application in a later sprint.

## Recommendations
1. Add duplicate detection to the data-processing logic.
2. Use controlled values for employment type and job category.
3. Validate required fields before a job record is displayed.
4. Keep search and filter behaviour consistent across the application.
5. Record Pass/Fail results once the corresponding UI features are available.
