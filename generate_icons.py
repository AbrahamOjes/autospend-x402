#!/usr/bin/env python3
"""
Generate simple icon files for the X402 Chrome extension.
This script creates basic colored icons with the text "X402" on them.
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Error: This script requires the Pillow library.")
    print("Please install it with: pip install Pillow")
    exit(1)

def create_icon(size, output_path):
    """Create a simple icon with the given size."""
    # Create a new image with blue background (Coinbase blue)
    img = Image.new('RGBA', (size, size), (0, 82, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Try to use a system font, fall back to default if not available
    try:
        # Calculate font size based on icon size
        font_size = int(size * 0.4)
        font = ImageFont.truetype("Arial", font_size)
    except IOError:
        font = ImageFont.load_default()
    
    # Add text "X402"
    text = "X402"
    text_width, text_height = draw.textsize(text, font=font) if hasattr(draw, 'textsize') else (font_size * len(text) * 0.6, font_size)
    position = ((size - text_width) // 2, (size - text_height) // 2)
    
    # Draw text in white
    draw.text(position, text, fill=(255, 255, 255, 255), font=font)
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created icon: {output_path}")

def main():
    # Make sure the icons directory exists
    icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
    os.makedirs(icons_dir, exist_ok=True)
    
    # Create icons in different sizes
    sizes = {
        "icon16.png": 16,
        "icon48.png": 48,
        "icon128.png": 128
    }
    
    for filename, size in sizes.items():
        output_path = os.path.join(icons_dir, filename)
        create_icon(size, output_path)
    
    print("All icons generated successfully!")

if __name__ == "__main__":
    main()
