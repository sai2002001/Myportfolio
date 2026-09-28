export default {
  async fetch(request, env) {
    const url = new URL(request.url);

if (url.pathname === "/googlec8434b882a66dcb0.html") {
  return new Response(
    "google-site-verification: googlec8434b882a66dcb0.html",
    {
      headers: {
        "Content-Type": "text/plain"
      }
    }
  );
}

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = body.message || body.prompt || "";

        if (!message.trim()) {
          return new Response(
            JSON.stringify({ error: "Message is required." }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        // DETERMINISTIC ANSWER FOR CHART QUESTIONS
        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("what charts") ||
          lowerMessage.includes("which charts") ||
          lowerMessage.includes("type of charts") ||
          lowerMessage.includes("chart types") ||
          (lowerMessage.includes("did sai create") &&
            lowerMessage.includes("chart"))
        ) {
          return new Response(
            JSON.stringify({
              answer:
                "His portfolio confirms that he created charts, graphs, tables, KPI cards, and interactive filters in Power BI. The portfolio does not specify the individual chart types."
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        const systemPrompt = `
You are the AI Assistant for J. Sai Gajendra's professional portfolio.

IMPORTANT:
Answer ONLY using the portfolio information provided below.

Do not use general Data Analyst, Power BI, SQL, programming, or business knowledge to fill missing information.

Do not assume, infer, guess, or invent details.

If the portfolio does not explicitly provide an answer, say:

"That specific information is not available in my portfolio."

CANDIDATE:
J. Sai Gajendra

ROLE:
Data Analyst | Power BI | DAX

EXPERIENCE:
2.5 years total:
- 1 year 6 months Data Research Analyst at Simpliaxis Solution
- 11 months BPO Associate at Teleperformance

SKILLS:
- Power BI
- DAX
- Microsoft Excel
- Google Sheets
- Data Analysis
- Data Cleaning
- Data Validation
- Data Preparation
- Data Quality
- Basic SQL
- Dashboard Development
- KPI Development
- Charts
- Graphs
- Tables
- Reporting

MAIN PROJECT:
EdTech Lead, Revenue & Payment Analytics Dashboard.

CONFIRMED PROJECT DETAILS:
- Approximately 4,500+ customer enquiry and lead records.
- Prepared and maintained data using Google Sheets.
- Cleaned and validated datasets.
- Built Power BI dashboards.
- Created KPI cards, charts, graphs, tables and interactive filters.
- Created DAX calculations for Total Leads, Total Revenue and Total Payments.
- Created current-month vs previous-month comparisons.
- Used the dashboard for business reporting and analysis.

CHART RULE:
The portfolio confirms only:
- Charts
- Graphs
- Tables
- KPI cards
- Interactive filters

The portfolio DOES NOT specify individual chart types.

Therefore, never claim that J. Sai Gajendra created:
- Bar charts
- Line charts
- Pie charts
- Scatter plots
- Column charts
- Stacked charts
- Area charts
- Funnel charts
- Gauge charts
- Donut charts
- Heat maps
- Any other specific chart type

unless that exact chart type is explicitly confirmed in the portfolio.

DAX RULE:
Confirmed DAX calculations:
- Total Leads
- Total Revenue
- Total Payments

Do not claim any other DAX measure.

SQL RULE:
Only Basic SQL knowledge is confirmed.

Do not claim professional SQL work experience, SQL projects, advanced SQL, database development, stored procedures, or advanced SQL queries.

FACTUALITY RULE:
Do not invent:
- Technologies
- Tools
- Certifications
- Responsibilities
- Achievements
- Numbers
- Dashboard features
- Project features
- Performance improvements
- Client information
- Business results
- Job titles
- Experience details

If information is missing, say:

"That specific information is not available in my portfolio."

ANSWER STYLE:
- Professional
- Concise
- Factual
- Direct
- No exaggeration
- No fictional examples

Portfolio facts have priority over general knowledge.
`;

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fast",
          {
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return new Response(
          JSON.stringify({
            answer:
              result.response ||
              "Sorry, I could not generate a response."
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "AI Assistant error.",
            details: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};