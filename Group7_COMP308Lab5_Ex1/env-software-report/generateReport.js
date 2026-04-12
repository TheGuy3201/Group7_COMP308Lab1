// generateReport.js
// Assignment helper: uses Gemini API to generate a 2–3 page style report
// on environmental impact of emerging software technologies and sustainable solutions.

// 1. Load environment variables
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 2. Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// 3. Example article text(s)
// Replace these with the content of at least one real article you’re using.
// You can paste full text, or a detailed excerpt/notes.
const article1 = `
Skip to content
|
Planetary Computer
Explore
Data Catalog
Applications
Documentation

Announcing Microsoft Planetary Computer Pro - Bring the power of the Planetary Computer to your private geospatial data.Click here to learn more
A Planetary Computer for a Sustainable Future
Supporting sustainability decision-making with the power of the cloudThe Planetary Computer combines a multi-petabyte catalog of global environmental data with intuitive APIs, a flexible scientific environment that allows users to answer global questions about that data, and applications that put those answers in the hands of conservation stakeholders.

The Planetary Computer includes petabytes of environmental monitoring data, in consistent, analysis-ready formats, accessible through our APIs as well as directly available via Azure Storage.

The Planetary Computer API makes it easy for users to find exactly the data they need, simplifying search and discovery across our Data Catalog.

Partners all over the world are building on top of the Planetary Computer platform, providing the actionable information that is critical to sustainability practitioners.
Building a global environmental network
The Planetary Computer is only as strong as the partner community that is building applications on it. If you are interested in scaling your environmental sustainability work with the power of the cloud, contact us.The Planetary Computer API is currently available in preview.
`;

const article2 = `

Skip to main content

    Global Action New
    Stories New

Sustainability

    Products and services

    AWS Cloud

AWS Cloud

Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud offering, with millions of global users depending on it every day. To build a sustainable business for our customers and for the world we all share, we’re designing data centers that provide the efficient, resilient service our customers expect while minimizing our environmental footprint—and theirs.
Read our 2024 Amazon Sustainability Report: AWS Summary
, opens in a new tab
Aerial view of a large data center at sunset. The building is surrounded by a paved parking lot. The sun sets casting warm colors in the sky.
Progress

4.1x AWS infrastructure is up to 4.1 times more energy efficient than on-premises and can reduce workloads’ carbon footprint

by up to 99%
A person walks down an aisle in a data center.

18B+ liters of water expected to be returned each year to local communities through Amazon’s water replenishment efforts
An irrigation system mists water on rows of leafy green crops.

100% of electricity consumed by Amazon was matched with renewable energy

sources in 2024, for the second consecutive year

100%
Our approach
Our sustainability work includes enhancing energy efficiency, transitioning to carbon-free energy, reducing embodied carbon
, using water responsibly, driving a circular economy
, and enabling sustainability for customers.
Increasing efficiency
We focus on efficiency across all aspects of our infrastructure, from the design of our data centers and hardware, to modeling the performance of our operations for continually enhanced efficiency. By working to improve efficiency, AWS can optimize the energy and water needed to power its data centers.
An aerial view of an Amazon facility with lights on at night.
A person wearing headphones and an AWS sweatshirt examines items in a data center.
A person examines large pipes in a utility room.
A computer chip sits on a dark table.
Power usage effectiveness and water usage effectiveness

AWS continually innovates its data center designs to increase efficiency. New data center components are projected to reduce mechanical energy consumption by up to 46% and reduce embodied carbon in the concrete used by 35%. As AWS builds new data centers, it seeks the optimal balance of energy and water use. AWS measures the efficiency of its data center operations through power usage effectiveness (PUE) and water usage effectiveness (WUE) metrics.
Power usage effectiveness

PUE is a measure of data center efficiency. A lower PUE indicates a more efficient data center and a PUE score of 1.0 is perfect. AWS calculates PUE using the internationally-recognized principles of the International Organization for Standardization (ISO) in line with our PUE Methodology.

In 2024, AWS data centers reported a global PUE of 1.15, and our best performing site was in Europe with a PUE of 1.04. In the Americas, our best performing site had a PUE of 1.05, and in Asia Pacific it was 1.07. These ratings are better than both the public cloud industry average of 1.25 and 1.63 for on-premises enterprise data centers, as estimated by the International Data Corporation.+

 

+IDC, 2H Datacenter Trends: Sustainable Datacenter Builds and CO2 Emissions. Doc # US51911924, January 2025’
Water usage effectiveness

WUE is a data center efficiency metric that measures the volume of water withdrawn per kWh of IT load within a data center. AWS works to minimize water use by using real-time data to identify leaks, leveraging on-site treatment technologies, fine-tuning mechanical cooling operational settings, and utilizing thousands of sensors to detect anomalies to alert operators of inefficiencies. 

Global infrastructure teams deploy cloud-based technology in AWS data centers to determine and track efforts to maintain or improve WUE. These efforts have helped AWS achieve a global data center WUE of 0.15 liters of water withdrawn per kilowatt-hour of IT Load (L/kWh) in 2024, a 17% improvement from 2023 and a 40% improvement since 2021.
Efficiency of scale

Our scale allows us to achieve higher resource utilization and energy efficiency than the typical on-premises
data center. A study released by Accenture and AWS estimates running optimized workloads on AWS’s infrastructure is up to 4.1 times more efficient than on-premises and can reduce workloads’ carbon footprint by up to 99%.
Download How Moving onto The AWS Cloud Reduces Carbon Emissions
, opens in a new tab
Predicting performance

We use advanced modeling methods, such as computational fluid dynamics tools, to optimize our data center design. This allows us to understand how a data center will perform before it’s built, enabling us to optimize for higher reliability and energy efficiency in our systems. Once our data centers are operational, real-time, physics-based models allow us to further improve and optimize our designs. We build these custom models using AWS services and weather datasets from the Amazon Sustainability Data Initiative to predict system performance for our sites and track their performance against how they should be operating.
Cooling efficiency

Cooling is one of the largest sources of energy usage in our data centers and we’re continually innovating in cooling efficiency. We use different cooling techniques depending on the time of year and use real-time sensor data to adapt to changing weather conditions. We’re also working to optimize the longevity and airflow performance of the cooling equipment used in our data center cooling systems.
Power efficiency

One of the most visible ways we’re using innovation to improve power efficiency is our investment in AWS chips.
See how Amazon Web Services is enabling sustainability solutions.
Visit AWS
Visit AWS
, opens in a new tab
A close-up view from the side of a wind turbine.
A person wearing safety equipment stands in front of solar panels.
Carbon-free energy
We're proud that 100% of electricity consumed by Amazon was matched with renewable energy sources in 2024, for the second consecutive year.
Explore carbon-free energy
Explore carbon-free energy
Rows of solar panels in a desert climate.
Renewable energy

We procure renewable power from utility-scale wind and solar projects that add new sources of carbon-free energy to the grid. These new renewable energy projects support hundreds of jobs while providing hundreds of millions of dollars of investment in local communities. We may support these grids through the purchase of environmental attributes, like Renewable Energy Certificates

and Guarantees of Origin, in line with our Renewable Energy Methodology.

 

In 2024, we continued to match 100% of electricity consumed by our global operations with renewable energy sources and worked with utilities and regulators on green tariffs so that more companies can buy carbon-free energy directly from renewable energy projects. 

 

Amazon’s energy supply from utilities, combined with the renewable energy we procure across the U.S., means that 100% of the electricity consumed by 24 AWS data center regions is matched by renewable energy sources.

Reducing embodied carbon
We’re focused on reducing the indirect emissions associated with building AWS data centers and the manufacturing of our hardware.
Displaying 1 of 1
3
Lower-carbon concrete and steel
We’re working to reduce the embodied carbon of materials like concrete and steel, which are used to build our data centers. Embodied carbon is emitted during the extraction, manufacturing, and transportation of materials to construction sites. In 2024, AWS constructed 38 data centers with lower-carbon concrete and 36 data centers with lower-carbon steel.
Concrete and steel beam infrastructure set with blue sky in the background.
Displaying 1 of
A person wheels a box of computer equipment down rows of server hardware.
Displaying 1 of
An ambiguous image of bubbles on a yellow surface.
Prioritizing a circular economy

AWS embraces circular economy principles for its server racks by designing reusable and lower-carbon rack systems from the outset. In addition, AWS works to keep equipment operating efficiently and to recover value from securely decommissioned equipment through reuse, repair, and recycling. By working to maximize resource value for as long as possible, AWS reduces waste generation from its global operations, decreases the use of raw materials
, and reduces carbon emissions across its supply chain

. 

 

In 2024, 11.5 million components were sold on the secondary market through our re:Cycle Reverse Logistics hubs. Additionally, these reverse logistics hubs have enabled AWS to source 16% of spare parts from its own reuse inventory, abating 110,000 tons of carbon emissions by avoiding purchase of new parts.

Design better

Operate longer

Recover more

Committed to being water positive
At Amazon, we know that water is a precious resource. AWS is committed to being water positive
by 2030 and making more water available to the communities where we operate.
Explore water stewardship
Explore water stewardship
Popular downloads

Methodologies
PDF, 266 KB
Renewable Energy Methodology

Download document

Paper
PDF, 14.1 MB
How moving onto the AWS cloud reduces carbon emissions

Download document
Discover the latest in AWS

    Sunlight glimmers through the ocean's surface.

November 5, 2025 3 min
How AWS uses recycled water in data centers , opens in a new tab

A graphic with a combination of images included people, electronics, and packaging.

October 17, 2025 3 min
How Amazon is experimenting with artificial intelligence to advance human rights , opens in a new tab

An aerial view of land with water flowing through it.

    October 15, 2025 3 min
    How open data is supporting more sustainable development in Africa , opens in a new tab

    Human Rights & Environmental Complaints Procedure

`;

const article3 = `sustainability.google uses cookies from Google to deliver and enhance the quality of its services and to analyze traffic. Learn more
Jump to Content
Sustainability

    Our products
    Our research
    Our operations
    Stories and reports

2025 Environmental Report
Google logo image
Making AI helpful for everyone, including the planet
marquee image first
marquee image second
marquee image third
marquee image fourth
marquee image fifth
marquee image sixth
marquee image seventh
marquee image eight

    Our products
    Our research
    Our operations
    motion button alt text

Our products, your impact

In 2024, just five of our products enabled individuals, cities, and other partners to collectively reduce an estimated 26 million metric tons of GHG emissions (tCO2e),1 roughly equivalent to the emissions from the annual energy use of over 3.5 million U.S. homes.2 For context, Google’s total ambition-based emissions in 2024 were 11.5 million tCO2e.3
card 1 image
Take the fuel-efficient route

Looking for a route that saves time and money?
Try it nowchevron right svg green plus icon svg
gas station svg
chevron right image white close icon svg
card image 2
Estimate your solar savings

How much could you save by switching?
Try it nowchevron right svg green plus icon svg
energy leaf svg
chevron right image white close icon svg
Use your devices longer
Use your devices longer

What if you could reduce e-waste and save money?
Try it nowchevron right svg green plus icon svg
back logo third card
chevron right image white close icon svg
front card image four
Shop pre-owned

Want to find unique and affordable items new to you?
Try it nowchevron right svg green plus icon svg
back icon four card
chevron right image white close icon svg
Explore all products
Driving innovation and resilience through our research

We’re partnering with cities, researchers, governments, and businesses on new technology to effect meaningful systemic change and improve the lives of billions of people.
ourResearch1.webp

Enabling airlines to reduce contrails
Learn more
Enhancing our ability to react to wildfires

Helping firefighters detect wildfires earlier
Learn more
Optimizing traffic lights to reduce vehicle emissions

Applying AI for more efficient city streets
Learn more

    Solar API

    Makes solar installation easier, faster, and more affordable.
    Explore tool
    card-one

    MethaneSAT

    Tracks global methane emissions with unprecedented precision.
    Explore tool
    Frame 2055245872.png

    Environmental Insights Explorer

    Aids cities in analyzing emissions, trees, solar potential, and more.
    Explore tool
    card-two

    Flood Hub

    Provides critical flood forecasts to millions of people up to 7 days in advance.
    Explore tool
    Flood-Hub.png

    Heat resilience

    Supports cities in addressing extreme heat.
    Explore tool
    Image.png

    Tapestry

    Visualizes the electric grid so more people can access clean energy.
    Explore tool
    Screenshot 2024-11-04 at 11.15.22 AM.png

See how we partner Explore all tools
Committed to the efficient and responsible use of resources

Across our operations, we’re dedicated to everything from replenishing water to improving AI efficiency. We’re strengthening the circular economy by designing out waste and implementing 100% plastic-free packaging. We’re also investing in next-generation clean energy technologies like advanced nuclear and enhanced geothermal. Below is a snapshot of our progress in 2024.
our-operations-image-one
our-operations-image-two
Energy savings leaf
Reduced data center energy emissions by 12%

In 2024, our data center emissions were reduced by 12% compared to the prior year, even in the face of increased energy demands.
water.svg
Replenished 64% of our freshwater consumption

In 2024, our water stewardship projects replenished approximately 64% of our freshwater consumption, or 4.5 billion gallons6 (roughly equivalent to the annual water usage of 40,000 average U.S. households7), up from 18% in 2023.
solar power
Procured over 8 GW of clean energy

In 2024, we signed contracts to purchase over 8 GW of clean energy generation8—more than in any prior year.
bolt_24dp_000000_FILL0_ROND50_wght400_GRAD0_opsz24.svg
Improved TPU power efficiency by 30x

Ironwood—the first Google TPU (our custom AI chips) designed to power thinking, inferential AI models at scale—is nearly 30 times more power efficient than our first Cloud TPU from 2018.9
Explore our operations
Stay informed

    Give your laptop a new life with ChromeOS Flex
    April 2, 2026

    Give your laptop a new life with ChromeOS Flex
    Read more
    We’re creating a new satellite imagery map to help protect Brazil’s forests.
    April 1, 2026

    We’re creating a new satellite imagery map to help protect Brazil’s forests.
    Read more
    Check out more certified refurbished Pixel models on the Google Store and Amazon Renewed.
    March 31, 2026

    Check out more certified refurbished Pixel models on the Google Store and Amazon Renewed.
    Read more
    Investing in a water-secure future for all
    March 23, 2026

    Investing in a water-secure future for all
    Read more

Explore all stories
1 To estimate aggregate enabled emissions reductions, we first estimated reductions for five products individually (Google Earth Pro, Solar API, Nest thermostats, fuel-efficient routing, and Green Light) and then combined the totals. For Solar API, we used the enabled emissions reductions following the annual (rather than lifetime) accounting basis. For details about the individual calculation methodologies, refer to our 2025 Environmental Report.
2 “Greenhouse Gas Equivalencies Calculator,” U.S. Environmental Protection Agency, November 2024, accessed June 2025.
3 We use the term “ambition-based” to describe the subset of emissions from our total carbon footprint that are within the boundaries we’ve set for our climate ambitions. For more details, refer to our 2025 Environmental Report.
4 Google uses an AI prediction model to estimate the expected fuel or energy consumption for each route option when users request driving directions. We identify the route that we predict will consume the least amount of fuel or energy. If this route is not already the fastest one and it offers meaningful energy and fuel savings with only a small increase in driving time, we recommend it to the user. To calculate enabled emissions reductions, we tally the fuel usage from the chosen fuel-efficient routes and subtract it from the predicted fuel consumption that would have occurred on the fastest route without fuel-efficient routing and apply adjustments for factors such as: CO2e factors, fleet mix factors, well-to-wheels factors, and powertrain mismatch factors. This figure covers estimated enabled emissions reductions for the calendar year, from January through December. Enabled emissions reductions estimates include inherent uncertainty due to factors that include the lack of primary data and precise information about real-world actions and their effects. These factors contribute to a range of possible outcomes, within which we report a central value. We then input the estimated prevented emissions into the EPA’s Greenhouse Gas Equivalencies Calculator to calculate equivalent cars off the road for a year.
5 According to the UN Economic Commission of Europe.
6 For details about this calculation, refer to the Methodology section in the Appendix of the 2025 Environmental Report.
7 From “How We Use Water,” U.S. Environmental Protection Agency.
8 The total GW figure represents primarily PPAs, and includes some generation from targeted renewable energy investments where we also receive EACs. Actual generation may vary from the signed amounts based on changes during construction or project terminations.
9 These calculations are based on internal data, as of March 2025. Google’s TPU power efficiency relative to the earliest generation Cloud TPU v2 is measured by peak FP8 flops delivered per watt of thermal design power per chip package.

`;

// 4. Build the prompt for Gemini
function buildPrompt() {
  return `
You are helping me write a short academic-style report (2–3 pages, around 800–1200 words).

The assignment:
- Study and discuss the impact of emerging software technologies on the environment.
- Explore sustainable solutions provided by major software/cloud providers (Microsoft, Amazon, Google, Meta, etc.).
- Use at least one article as a source and produce a clear, structured summary.

Here is Article 1:
${article1}

Here is Article 2 (may be empty):
${article2}

Here is Article 3 (may be empty):
${article3}

TASK:
1. Write a cohesive report in clear, formal English.
2. Length: roughly 800–1200 words (about 2–3 pages double-spaced).
3. Structure the report with sections, for example:
   - Introduction
   - Environmental impact of emerging software technologies
   - Sustainable strategies by major providers (Microsoft, Amazon, Google, Meta, etc.)
   - Challenges and trade-offs
   - Conclusion
4. Explicitly reference ideas from at least one of the provided articles (you can say things like
   "According to one article..." or "One source highlights...").
5. Do NOT fabricate citations; keep references general (no fake URLs or DOIs).
6. Output in Markdown format so it’s easy to copy into a document editor.

Now write the full report.
`;
}

// 5. Main function to call Gemini and print the report
async function generateReport() {
  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = buildPrompt();

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('===== GENERATED REPORT (Markdown) =====\n');
    console.log(text);
    console.log('\n===== END OF REPORT =====');
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

// 6. Run the script
generateReport();
