import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { reviews } = req.body; // Expecting an array of reviews
    const endpoint = process.env.AZURE_ENDPOINT;
    const apiKey = process.env.AZURE_API_KEY;

    const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
    const documents = reviews.map((text, index) => ({ id: String(index + 1), language: 'en', text }));

    try {
      const sentimentResult = await client.analyzeSentiment(documents);
      const sentiments = sentimentResult.map(result => {
        console.log(`Review ${result.id}: Sentiment - ${result.sentiment}, Positive Score - ${result.confidenceScores.positive}, Neutral Score - ${result.confidenceScores.neutral}, Negative Score - ${result.confidenceScores.negative}`);
        return {
          sentiment: result.sentiment,
          confidenceScores: result.confidenceScores
        };
      });
      res.status(200).json({ success: true, sentiments });
    } catch (error) {
      console.error('Azure AI error:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze sentiment' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
