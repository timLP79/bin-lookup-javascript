# BIN Lookup Tool

A simple, client-side web application for searching Bank Identification Numbers (BINs) from a comprehensive database.

## Features

- **BIN Search**: Search by BIN number prefix to find matching card records
- **Keyword Search**: Search across all columns using space-separated keywords
- **Pagination**: Navigate through large result sets with configurable items per page
- **Responsive Design**: Clean, professional interface that works on desktop and mobile
- **Real-time Results**: Instant search results with no backend required
- **Client-Side Processing**: All data processing happens in the browser for fast performance

## How to Use

### Running the Tool

1. Ensure all files (`index.html`, `styles.css`, `script.js`) are in the same directory
2. Open `index.html` in any modern web browser
3. Wait for the data to load (you'll see "System Ready" when complete)
4. Choose your search method using the tabs

### BIN Search

1. Click the "BIN Search" tab
2. Enter a BIN number (or partial BIN) in the search field
   - Example: `414720` will find all BINs starting with 414720
3. Set the number of results per page (default: 10)
4. Click "Search" or press Enter
5. Browse results using the pagination controls

### Keyword Search

1. Click the "Keyword Search" tab
2. Enter one or more keywords separated by spaces
   - Example: `visa credit usa` will find records containing all three terms
3. Set the number of results per page (default: 10)
4. Click "Search" or press Enter
5. Browse results using the pagination controls

## Technical Details

### Technology Stack

- **HTML5**: Structure and layout
- **CSS3**: Styling with CSS variables for theming
- **Vanilla JavaScript**: No frameworks required
- **CSV Parsing**: Custom parser for handling CSV data

### Data Source

The tool loads BIN data from:
```
https://raw.githubusercontent.com/venelinkochev/bin-list-data/refs/heads/master/bin-list-data.csv
```

### Browser Compatibility

Works with all modern browsers that support:
- ES6+ JavaScript (async/await, arrow functions, etc.)
- Fetch API
- CSS Grid and Flexbox

Recommended browsers:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### File Structure

```
bin-lookup/
├── index.html          # Main HTML structure
├── styles.css          # Custom CSS styling
├── script.js           # JavaScript application logic
└── README.md           # This file
```

## Features in Detail

### Search Capabilities

- **Prefix Matching**: BIN search uses startsWith() for efficient prefix matching
- **Multi-column Search**: Keyword search examines all columns in the dataset
- **Case-Insensitive**: All keyword searches ignore case
- **Multiple Keywords**: Keyword search requires ALL keywords to match (AND logic)

### User Interface

- **Tabbed Interface**: Switch between search modes easily
- **Sticky Headers**: Table headers remain visible while scrolling
- **Hover Effects**: Visual feedback on interactive elements
- **Status Messages**: Clear success/error messages for user actions
- **Keyboard Support**: Press Enter to submit searches

### Performance

- **In-Memory Data**: All data loaded once and cached in browser memory
- **Efficient Filtering**: JavaScript array methods for fast searching
- **Lazy Rendering**: Only renders visible page of results
- **Minimal Dependencies**: No external libraries required

## Customization

### Changing Colors

The tool uses CSS variables for theming. Edit these in `styles.css` at the `:root` section:

```css
:root {
    --bsu-blue: #0033A0;        /* Primary color */
    --bsu-orange: #D64309;      /* Accent color */
    --bsu-light-gray: #f4f4f4;  /* Background */
    --bsu-dark-gray: #333;      /* Text color */
}
```

### Changing Data Source

To use a different CSV file, modify the `loadData()` function in `script.js`:

```javascript
const response = await fetch('YOUR_CSV_URL_HERE');
```

## Limitations

- Requires internet connection to load CSV data
- CSV file must be accessible via CORS-enabled URL
- Large datasets may take time to load initially

## License

This project is provided as-is for educational and personal use.

## Credits

- **BIN Data**: [venelinkochev/bin-list-data](https://github.com/venelinkochev/bin-list-data)
- **Design**: Boise State University color scheme
