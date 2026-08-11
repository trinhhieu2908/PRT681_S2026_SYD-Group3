# Week 3 – Job Data Analysis Summary

**Role:** Data Analyst & Tester

## Purpose
The purpose of this analysis is to identify the main dimensions that should be
available for job search and filtering.

## Key Data Dimensions
### Job Category
Examples include:
- Information Technology
- Data & Analytics
- Software Engineering

### Location
The sample data includes locations such as:
- Sydney, NSW
- Parramatta, NSW
- Melbourne, VIC

### Employment Type
The initial dataset uses:
- Full-time
- Part-time

## Data Analysis Observations
1. Category should use controlled values so that similar categories are not stored
   under different names.
2. Location should follow a consistent City, State format.
3. Employment type should use a fixed set of allowed values.
4. Duplicate listings should be detected before they affect search results.
5. Required fields should be validated before a job is displayed.

## Testing Relevance
These dimensions directly support the application's search and filtering functions.
They should therefore be included in regression testing whenever the job data model
or search/filter logic changes.

## Limitation
This is an initial analysis of the sample development dataset, not a statistical
analysis of a live job market.
