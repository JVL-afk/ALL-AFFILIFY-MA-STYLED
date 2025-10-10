import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../../lib/database';
import { ObjectId } from 'mongodb';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface UserData {
  _id: ObjectId;
  email: string;
  plan: string;
  websiteCount: number;
}

// Get professional images from Unsplash API
async function getUnsplashImages(query: string, count: number = 3) {
  try {
    const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY
    if (!unsplashApiKey) {
      console.log('Unsplash API key not found, using placeholder images')
      return generatePlaceholderImages(query, count)
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&order_by=relevant`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashApiKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.results.map((photo: any) => ({
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      alt: photo.alt_description || query,
      credit: `Photo by ${photo.user.name} on Unsplash`,
      download_url: photo.links.download_location
    }))
  } catch (error) {
    console.error('Unsplash API error:', error)
    return generatePlaceholderImages(query, count)
  }
}

// Generate placeholder images if Unsplash fails
function generatePlaceholderImages(query: string, count: number) {
  const images = []
  for (let i = 0; i < count; i++) {
    images.push({
      url: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center`,
      thumb: `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`,
      alt: query,
      credit: 'Professional stock photo',
      download_url: null
    })
  }
  return images
}

// Deploy website to Netlify
async function deployToNetlify(websiteHTML: string, siteName: string) {
  try {
    const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN
    if (!netlifyToken) {
      console.log('Netlify token not found, returning local URL')
      return null
    }

    // Create a new site on Netlify
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: siteName,
        custom_domain: null
      })
    })

    if (!siteResponse.ok) {
      throw new Error(`Netlify site creation error: ${siteResponse.status}`)
    }

    const siteData = await siteResponse.json()
    const siteId = siteData.id

    // Deploy the HTML content
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/zip'
      },
      body: createZipFromHTML(websiteHTML)
    })

    if (!deployResponse.ok) {
      throw new Error(`Netlify deploy error: ${deployResponse.status}`)
    }

    const deployData = await deployResponse.json()
    
    return {
      url: siteData.ssl_url || siteData.url,
      deploy_id: deployData.id,
      site_id: siteId,
      admin_url: siteData.admin_url
    }
  } catch (error) {
    console.error('Netlify deployment error:', error)
    return null
  }
}

// Create ZIP file from HTML content for Netlify deployment
function createZipFromHTML(html: string) {
  // For now, return the HTML as a simple buffer
  // In production, you'd want to use a proper ZIP library
  return Buffer.from(html, 'utf8')
}

// Generate REAL website content using Gemini AI with Unsplash images
async function generateWebsiteContent(productInfo: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Get professional images from Unsplash
  const heroImages = await getUnsplashImages(`${productInfo.title} product lifestyle`, 1)
  const featureImages = await getUnsplashImages(`${productInfo.title} benefits features`, 2)
  const testimonialImages = await getUnsplashImages('happy customer testimonial', 1)
  
  const prompt = `
THE ULTIMATE AFFILIFY MASTER SYSTEM

PRODUCT INFORMATION:
- Title: ${productInfo.title}
- Description: ${productInfo.description}
- Price: ${productInfo.price}
- Original URL: ${productInfo.originalUrl}

PROFESSIONAL IMAGES AVAILABLE:
- Hero Image: ${heroImages[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
- Feature Image 1: ${featureImages[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
- Feature Image 2: ${featureImages[1]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}
- Testimonial Image: ${testimonialImages[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}

CRITICAL MISSION: Create a professional, high-converting affiliate website that will generate $1000+ in the first week.

RESPOND WITH ONLY VALID HTML CODE - NO JSON, NO EXPLANATIONS, JUST PURE HTML:

Create a complete, professional HTML website with:

1. MODERN RESPONSIVE DESIGN
- Mobile-first responsive layout
- Professional color scheme (blues, whites, grays)
- Modern typography and spacing
- CSS Grid and Flexbox layouts

2. HIGH-CONVERTING STRUCTURE
- Compelling hero section with the provided hero image
- Clear value proposition and benefits
- Social proof and testimonials with testimonial image
- Strong call-to-action buttons
- Trust signals and guarantees

3. PROFESSIONAL CONTENT
- Benefit-focused headlines
- Emotional triggers and urgency
- Feature explanations with feature images
- Risk reversal and guarantees
- Professional testimonials

4. TECHNICAL EXCELLENCE
- Clean, semantic HTML5
- Embedded CSS for styling
- Mobile responsive design
- Fast loading optimization
- SEO-friendly structure

5. CONVERSION OPTIMIZATION
- Multiple call-to-action buttons
- Scarcity and urgency elements
- Social proof throughout
- Easy navigation and flow
- Professional appearance

The website should look like a professional $10,000+ landing page that converts visitors into customers immediately.

USE THE PROVIDED UNSPLASH IMAGES IN THE APPROPRIATE SECTIONS.

GENERATE COMPLETE HTML CODE NOW:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let websiteHTML = response.text();
    
    // Clean up the response to ensure it's valid HTML
    websiteHTML = websiteHTML.replace(/```html/g, '').replace(/```/g, '').trim();
    
    // If the response doesn't start with HTML, extract it
    if (!websiteHTML.toLowerCase().includes('<!doctype') && !websiteHTML.toLowerCase().includes('<html')) {
      // Try to find HTML content in the response
      const htmlMatch = websiteHTML.match(/<!DOCTYPE[\s\S]*<\/html>/i);
      if (htmlMatch) {
        websiteHTML = htmlMatch[0];
      } else {
        // Fallback to professional template
        websiteHTML = generateProfessionalTemplate(productInfo, heroImages, featureImages, testimonialImages);
      }
    }
    
    return websiteHTML;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return generateProfessionalTemplate(productInfo, heroImages, featureImages, testimonialImages);
  }
}

// Professional fallback template with Unsplash images
function generateProfessionalTemplate(productInfo: any, heroImages: any[], featureImages: any[], testimonialImages: any[]) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productInfo.title} - Professional Affiliate Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; margin-bottom: 30px; }
        .cta-button { background: #ff6b6b; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer; text-decoration: none; display: inline-block; }
        .features { padding: 80px 0; background: #f8f9fa; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; margin-top: 50px; }
        .feature { text-align: center; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .feature img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; }
        .testimonials { padding: 80px 0; }
        .testimonial { text-align: center; max-width: 600px; margin: 0 auto; }
        .testimonial img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; }
        @media (max-width: 768px) { .hero h1 { font-size: 2rem; } .feature-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${productInfo.title}</h1>
            <p>${productInfo.description}</p>
            <a href="${productInfo.originalUrl}" class="cta-button">Get ${productInfo.title} Now - ${productInfo.price}</a>
        </div>
    </section>
    
    <section class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 20px;">Why Choose ${productInfo.title}?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <img src="${featureImages[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}" alt="Premium Quality">
                    <h3>Premium Quality</h3>
                    <p>Experience the highest quality standards with ${productInfo.title}. Built to last and designed to impress.</p>
                </div>
                <div class="feature">
                    <img src="${featureImages[1]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}" alt="Amazing Value">
                    <h3>Amazing Value</h3>
                    <p>Get incredible value for your money. ${productInfo.title} delivers results that exceed expectations.</p>
                </div>
            </div>
        </div>
    </section>
    
    <section class="testimonials">
        <div class="container">
            <div class="testimonial">
                <img src="${testimonialImages[0]?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'}" alt="Happy Customer">
                <h3>"Life-changing results!"</h3>
                <p>"${productInfo.title} has completely transformed my experience. I couldn't be happier with my purchase!"</p>
                <strong>- Sarah Johnson, Verified Customer</strong>
            </div>
            <div style="text-align: center; margin-top: 40px;">
                <a href="${productInfo.originalUrl}" class="cta-button">Order ${productInfo.title} Today - ${productInfo.price}</a>
            </div>
        </div>
    </section>
</body>
</html>`;
}

// Analyze product URL to extract information
async function analyzeProductURL(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract product information
    const title = $('title').text() || 
                  $('h1').first().text() || 
                  $('[data-testid="product-title"]').text() ||
                  'Amazing Product';

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') ||
                       $('p').first().text() ||
                       'Discover this incredible product that will transform your life.';

    const price = $('[data-testid="price"]').text() ||
                  $('.price').first().text() ||
                  $('[class*="price"]').first().text() ||
                  '$99.99';

    return {
      title: title.substring(0, 100),
      description: description.substring(0, 200),
      price: price.substring(0, 20),
      originalUrl: url
    };
  } catch (error) {
    console.error('URL analysis error:', error);
    return {
      title: 'Premium Product',
      description: 'An amazing product that delivers exceptional value and results.',
      price: '$99.99',
      originalUrl: url
    };
  }
}

// Verify user authentication
async function verifyUser(request: NextRequest): Promise<UserData | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ 
      authToken: token 
    });

    return user as UserData | null;
  } catch (error) {
    console.error('User verification error:', error);
    return null;
  }
}

// Get plan limits
function getPlanLimits(plan: string) {
  switch (plan) {
    case 'basic':
      return { websites: 3 };
    case 'pro':
      return { websites: 10 };
    case 'enterprise':
      return { websites: 999 };
    default:
      return { websites: 3 };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request data
    const { productUrl } = await request.json();
    if (!productUrl) {
      return NextResponse.json(
        { error: 'Product URL is required' },
        { status: 400 }
      );
    }

    // Check plan limits
    const limits = getPlanLimits(user.plan);
    const currentWebsiteCount = user.websiteCount || 0;

    if (currentWebsiteCount >= limits.websites) {
      return NextResponse.json(
        { 
          error: 'Website limit reached',
          message: `Your ${user.plan} plan allows ${limits.websites} websites. Please upgrade to create more.`,
          currentCount: currentWebsiteCount,
          limit: limits.websites
        },
        { status: 403 }
      );
    }

    // Analyze REAL product URL
    console.log('Analyzing affiliate URL:', productUrl);
    const productInfo = await analyzeProductURL(productUrl);

    // Generate REAL website content using AI with Unsplash images
    console.log('Generating professional website content with Unsplash images...');
    const websiteHTML = await generateWebsiteContent(productInfo);

    // Generate unique slug for the website
    const slug = productInfo.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // Deploy to Netlify for live URL
    console.log('Deploying website to Netlify...');
    const netlifyDeployment = await deployToNetlify(websiteHTML, slug);

    // Save website to database
    const { db } = await connectToDatabase();
    const websiteData = {
      _id: new ObjectId(),
      userId: user._id,
      slug,
      title: productInfo.title,
      description: productInfo.description,
      productUrl,
      html: websiteHTML,
      productInfo,
      netlifyDeployment,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      clicks: 0,
      isActive: true
    };

    await db.collection('websites').insertOne(websiteData);

    // Update user website count
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { websiteCount: 1 } }
    );

    console.log('Website created successfully:', slug);

    // Determine the live URL
    const liveUrl = netlifyDeployment?.url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://affilify.eu'}/websites/${slug}`;

    // Return success response
    return NextResponse.json({
      success: true,
      website: {
        id: websiteData._id.toString(),
        slug,
        title: productInfo.title,
        description: productInfo.description,
        url: liveUrl,
        previewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://affilify.eu'}/preview/${slug}`,
        netlifyUrl: netlifyDeployment?.url || null,
        adminUrl: netlifyDeployment?.admin_url || null
      },
      message: 'Professional affiliate website created and deployed successfully!',
      remainingWebsites: limits.websites - currentWebsiteCount - 1,
      deployment: {
        status: netlifyDeployment ? 'deployed' : 'local',
        platform: netlifyDeployment ? 'netlify' : 'affilify'
      }
    });

  } catch (error) {
    console.error('Website generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create website',
        message: 'An error occurred while creating your affiliate website. Please try again.'
      },
      { status: 500 }
    );
  }
}

