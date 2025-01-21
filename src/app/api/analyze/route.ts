import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

interface AnalyzeRequest {
  topic: string;
  studentName: string;
  schoolGrade: string;
  accuracy: 'basic' | 'facts_correctness' | 'complete' | 'comprehensive';
  bulletPoints: string;
  preparedText: string;
  spokenText: string;
  language: 'german' | 'english' | 'latin';
}

export async function POST(request: Request) {
  try {
    console.log('Starting API request...');

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'API key not configured'
        },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const body: AnalyzeRequest = await request.json();

    const { topic, studentName, schoolGrade, accuracy, bulletPoints, spokenText, language } = body;

    // Define analysis instructions based on accuracy level
    const getAnalysisInstructions = (accuracyLevel: string) => {
      switch (accuracyLevel) {
        case 'basic':
          return `
          Focus ONLY on checking if these facts are covered in the response:
          ${bulletPoints}

          Analyze only:
          1. Are all required facts mentioned? (yes/no for each fact)
          2. If any facts are missing, list them

          Keep the feedback very simple and focused only on fact coverage.
          `;

        case 'facts_correctness':
          return `
          Focus on facts coverage and their correctness:
          1. Are all required facts mentioned? (check each fact)
          2. Is the information correct for each mentioned fact?
          3. If any facts are incorrect, what's wrong?

          Keep the feedback focused on facts and their accuracy.
          `;

        case 'complete':
          return `
          Provide a complete analysis including:
          1. Facts coverage and accuracy
          2. Basic language structure
          3. Logical flow of information
          4. Brief suggestions for improvement

          Provide balanced feedback on both content and presentation.
          `;

        case 'comprehensive':
          return `
          Provide a comprehensive review including:
          1. Detailed analysis of facts coverage and accuracy
          2. Grammar and sentence structure
          3. Academic language level evaluation
          4. Logical organization of content
          5. Detailed suggestions for improvement
          6. Examples of better formulations where appropriate

          Provide thorough feedback on all aspects of the response.
          `;

        default:
          return `Focus on facts coverage and basic accuracy.`;
      }
    };

    const analysisInstructions = getAnalysisInstructions(accuracy);

    console.log('Received request body:', body);

    if (!bulletPoints || !spokenText) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    const promptLanguage = language === 'german' ? 'German' :
      language === 'latin' ? 'Latin' : 'English';

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Please analyze this student's test preparation response in ${promptLanguage} and address the student with its name.
          IMPORTANT: ${studentName || 'The student'} is in grade ${schoolGrade} (Gymnasium) in Berlin. 
          This is a speech-to-text response, so it naturally lacks punctuation.
  
          Topic: ${topic}
  
          Required facts to cover:
          ${bulletPoints}
  
          Student's spoken response:
          ${spokenText}
  
          ${analysisInstructions}
  
          Return your analysis in this exact JSON format:
          {
            "success": boolean indicating if the response meets the requirements for this analysis level,
            "message": "brief, clear assessment in ${promptLanguage}, focusing only on the requested analysis aspects",
            "details": "detailed feedback in ${promptLanguage} that strictly follows the analysis level requirements specified above. ${
              accuracy === 'basic' ? 'Focus ONLY on fact coverage.' :
              accuracy === 'facts_correctness' ? 'Focus on facts coverage and accuracy.' :
              accuracy === 'complete' ? 'Provide complete analysis of content and basic structure.' :
              'Provide comprehensive analysis of all aspects.'
            }"
          }`
        }]
      });

    // Log the entire message structure
    console.log('Message structure:', JSON.stringify(message, null, 2));

    // Handle the response content
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : JSON.stringify(message.content);

    console.log('Response Text:', responseText);

    // Parse the JSON response from Claude
    const analysisContent = JSON.parse(responseText.replace(/[\n\r]/g, ''));

    return NextResponse.json({
      success: analysisContent.success,
      message: analysisContent.message,
      details: analysisContent.details
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error analyzing response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}