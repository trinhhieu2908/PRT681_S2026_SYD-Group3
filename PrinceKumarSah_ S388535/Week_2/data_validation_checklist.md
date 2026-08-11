# Week 2 – Data Validation Checklist

**Role:** Data Analyst & Tester  
**Team Member:** Prince Kumar Sah

## Validation Rules

| ID | Validation | Expected Result |
|---|---|---|
| DV-01 | Job ID uniqueness | Every job has a unique ID |
| DV-02 | Required job title | Job title is not blank |
| DV-03 | Required company | Company name is not blank |
| DV-04 | Salary range | Minimum salary is not greater than maximum salary |
| DV-05 | Employment type | Value is one of Full-time, Part-time, Casual or Contract |
| DV-06 | Job category | Category is present and consistently named |
| DV-07 | Posted date | Posted date is valid |
| DV-08 | Duplicate detection | Similar duplicate listings are identified |
| DV-09 | Application URL | URL is present and correctly formatted when required |
| DV-10 | Text consistency | Location and category values use consistent naming |

## Data Cleaning Approach
1. Identify missing required values.
2. Detect duplicate job records.
3. Standardise category and employment-type values.
4. Check salary ranges for invalid values.
5. Validate dates and application links.
6. Record issues before changing source data.
