# Mercado Pago Credit Section

This project contains HTML and CSS files generated from your Figma design for the "Consigue un crédito usando Mercado Pago" section.

## Files Generated

- `index.html` - Main HTML structure
- `styles.css` - CSS styling with converted Tailwind classes
- `README.md` - This file with instructions

## Features

- Responsive design that works on desktop, tablet, and mobile
- Clean semantic HTML structure
- CSS converted from Tailwind classes to vanilla CSS
- Proper typography using Proxima Nova font family
- Background images for the cards

## Important Notes

### Background Images
The CSS currently references images from localhost URLs:
- Card 01: `http://localhost:3845/assets/a16945d035d074ac37fa07c50ddc4b0b7551d7fd.png`
- Card 02: `http://localhost:3845/assets/c794857b172070a6afb57faa62d15221c25701b4.png`

### To use your own images:
1. Save the images from your Figma design
2. Place them in a local `assets/` or `images/` folder
3. Update the CSS file to reference your local image paths:
   ```css
   .card-01 {
       background-image: url('./assets/card-01.png');
   }
   
   .card-02 {
       background-image: url('./assets/card-02.png');
   }
   ```

### Font Loading
The design uses Proxima Nova font. To ensure proper display:
1. Include Proxima Nova font files in your project, or
2. Use a web font service like Google Fonts with a similar font, or
3. The CSS includes fallback fonts that will be used if Proxima Nova is not available

## Usage

1. Open `index.html` in a web browser to view the design
2. Modify the CSS in `styles.css` to customize styling
3. Replace image URLs with your actual image assets
4. Integrate into your existing website or application

## Responsive Breakpoints

- Desktop: Full layout with side-by-side cards
- Tablet (< 1200px): Reduced padding, smaller title
- Mobile (< 768px): Stacked cards, further reduced text sizes

The design maintains the visual hierarchy and readability across all screen sizes.