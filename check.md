LEAD GENERATION & RESEARCH agents
Purpose

These agents is responsible for:

Discovering businesses that match a target niche.
Enriching business data.
Researching each business.
Identifying opportunities and possible pain points.
Producing a structured lead profile.

LEAD GENERATION /SCRAPING AGENT
A). WORKFLOW OVERVIEW
Lead Discovery
↓
Lead Validation
↓
Lead Enrichment
↓
Business Research
↓
Pain Point Analysis
↓
Lead Profile Creation
↓
Store Results

TOOL 1 — MAPS DATA API & APIFY
Purpose

Primary Lead Discovery Tool.

Used to find businesses matching a niche, location, or industry.

Examples:

Find 300 dentists in USA

Find 500 roofing companies in Texas

Find 100 restaurants in Lagos

Find 200 law firms in London

- When To Use

Use FIRST whenever the task requires finding businesses.

Examples:

Find businesses

Generate leads

Find prospects

Find companies

Find local businesses

_ Data To Collect

Always collect:

Business Name
Website
Phone Number
Address
Category
Rating
Review Count
Maps URL
Expected Output
{
  "business_name": "",
  "website": "",
  "phone": "",
  "address": "",
  "category": ""
}
Rules

Never stop after discovery.

All discovered businesses must proceed to validation and enrichment.

----------------------------------------------------------
RESEARCH AGENT SKILL

TOOL 2 — SERPER
Purpose

Validation and Missing Information Retrieval.

Serper is NOT the primary discovery tool.

-Use Serper When
Website Missing

Input:

Business Name

Search:

Official website of [Business Name]

Retrieve:

Website URL
Social Profiles Missing

Search for:

Facebook
Instagram
LinkedIn
TikTok
Twitter/X
Additional Business Signals

Search for:

Reviews
News
Press Mentions
Awards
Business Listings
Rules

Use Serper only when:

Data is missing
OR
Additional research is required

Do not use Serper before Maps Data API unless explicitly instructed.

TOOL 3 — SCRAPLING
Purpose

Primary Website Research Tool.

Scrapling is NOT a discovery tool.

Scrapling must only be used when a website is available.

Use Scrapling To Extract
Contact Information
Emails
Phone Numbers
Contact Forms
Addresses
Social Presence
Facebook
Instagram
LinkedIn
TikTok
YouTube
Twitter/X
Business Information
Services
Products
Locations
Pricing Information
Team Information
Testimonials
Reviews
Website Features

Determine whether the business has:

Online Booking
Live Chat
CRM Forms
Newsletter Signup
Blog
Knowledge Base
Online Payments
Crawl These Pages

Always attempt:

/
about
services
products
contact
pricing
team
blog
faq

If pages exist.

Rules

Do not scrape unnecessary pages.

Focus only on business-related information.

B). LEAD ENRICHMENT PROCESS

After discovery:

Business Found
↓
Website Available?
If Website Exists
Scrapling
↓
Research Business
If Website Missing
Serper
↓
Find Website

If website found:

Scrapling
↓
Research Business

If website cannot be found:

Continue with available data
BUSINESS RESEARCH PROCESS

Agent must create a Business Research Report.

Extract
Services

Identify:

What the company sells
What services they provide
Who they serve
Market Positioning

Identify:

Target audience
Unique selling proposition
Core offerings
Digital Presence

Evaluate:

Website quality
Social activity
Review presence
Lead capture systems
PAIN POINT ANALYSIS

Pain points must NEVER be invented.

Agent must separate:

Observed Facts

from

Likely Inferences
Example
Observed Facts
No online booking
No chatbot
Last blog post 2022
Only Facebook present
Likely Inferences
Potential manual lead handling

Potential weak content strategy

Potential poor customer engagement

_ OPPORTUNITY ANALYSIS

Based on findings identify opportunities.

Examples:

Website Redesign

SEO Improvement

AI Chatbot

AI Receptionist

Lead Automation

CRM Implementation

Social Media Automation

Mobile App Development

Only recommend opportunities supported by evidence.

C). LEAD PROFILE FORMAT

For every business create:

{
  "business_name": "",

  "website": "",

  "email": "",

  "phone": "",

  "address": "",

  "socials": [],

  "services": [],

  "research_summary": "",

  "observed_facts": [],

  "pain_points": [],

  "opportunities": [],

  "recommended_service": "",

  "confidence_score": 0
}

D). STORAGE RULES


Store:

Lead Information
Research Summary
Pain Points
Opportunities
Recommended Service

Do NOT store:

Entire Website HTML

Entire Website Content

Raw Crawl Dumps

Store only processed business intelligence.

PRIORITY ORDER

Whenever researching a lead, agent must use tools in this order:

1. Maps Data API + APIFY
   ↓
2. Serper (if needed)
   ↓
3. Scrapling
   ↓
4. Analysis
   ↓
5. Storage

E). SUCCESS CRITERIA

A lead is considered complete only when Agent has:

✓ Business Name

✓ Website (if available)

✓ Phone

✓ Email (if available)

✓ Services

✓ Research Summary

✓ Observed Facts

✓ Pain Points

✓ Opportunities

✓ Recommended Service

✓ Stored Record



* Needed credentials 

1. scrapling github repo: https://github.com/d4vinci/Scrapling

2. scrape graph github repo: https://github.com/ScrapeGraphAI/Scrapegraph-ai

3. here is my RapidApi key : e0199a87b6msh86292b0b0d9dd63p172b74jsnf169d511aaeb

3b. Maps data endpoint

curl --request GET \
	--url 'https://maps-data.p.rapidapi.com/searchmaps.php?query=restaurant&limit=20&country=us&lang=en&lat=51.5072&lng=0.12&offset=0&zoom=13' \
	--header 'Content-Type: application/json' \
	--header 'x-rapidapi-host: maps-data.p.rapidapi.com' \
	--header 'x-rapidapi-key: e0199a87b6msh86292b0b0d9dd63p172b74jsnf169d511aaeb'


4. serper api key: acc4f2b6aeb7322aeb932b8d35ce05d7a68693f2

