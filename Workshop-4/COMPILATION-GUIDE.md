# LaTeX Compilation Guide

This guide explains how to compile the `Workshop-4-Report.tex` document into a PDF.

## Prerequisites

You need a LaTeX distribution installed on your system:

### Windows
- **MiKTeX**: https://miktex.org/download (Recommended)
- **TeX Live**: https://www.tug.org/texlive/

### macOS
- **MacTeX**: https://www.tug.org/mactex/
- Or use Homebrew: `brew install --cask mactex`

### Linux
- **TeX Live**: Install via package manager
  ```bash
  # Ubuntu/Debian
  sudo apt-get install texlive-full
  
  # Fedora
  sudo dnf install texlive-scheme-full
  ```

## Required LaTeX Packages

The document uses the following packages (usually included in full LaTeX distributions):

- `inputenc`
- `babel` (english, spanish)
- `geometry`
- `graphicx`
- `hyperref`
- `listings`
- `xcolor`
- `amsmath`
- `float`
- `caption`
- `subcaption`
- `booktabs`
- `longtable`
- `multirow`
- `titlesec`
- `fancyhdr`
- `tocloft`

If a package is missing, your LaTeX distribution should prompt you to install it automatically.

## Compilation Methods

### Method 1: Command Line (Recommended)

1. Open a terminal/command prompt
2. Navigate to the Workshop-4 directory:
   ```bash
   cd Workshop-4
   ```
3. Compile the document:
   ```bash
   # Using pdflatex (recommended)
   pdflatex Workshop-4-Report.tex
   pdflatex Workshop-4-Report.tex  # Run twice for references
   
   # Or use the build script (if available)
   ./build.sh
   ```

### Method 2: Using an IDE

#### TeXstudio
1. Open `Workshop-4-Report.tex` in TeXstudio
2. Click "Build & View" (F5) or "Build" (F6)

#### VS Code with LaTeX Workshop Extension
1. Install the "LaTeX Workshop" extension
2. Open `Workshop-4-Report.tex`
3. Press `Ctrl+Alt+B` (Windows/Linux) or `Cmd+Alt+B` (Mac) to build

#### Overleaf (Online)
1. Go to https://www.overleaf.com/
2. Create a new project
3. Upload `Workshop-4-Report.tex`
4. Click "Recompile" button

### Method 3: Automated Build Script

Create a build script for your operating system:

#### Windows (build.bat)
```batch
@echo off
pdflatex Workshop-4-Report.tex
pdflatex Workshop-4-Report.tex
echo Build complete!
```

#### Linux/macOS (build.sh)
```bash
#!/bin/bash
pdflatex Workshop-4-Report.tex
pdflatex Workshop-4-Report.tex
echo "Build complete!"
```

Make the script executable:
```bash
chmod +x build.sh
```

## Compilation Steps

The document requires two compilation passes to resolve all cross-references:

1. **First pass**: Processes the document and creates auxiliary files (.aux, .toc, .lof, .lot)
2. **Second pass**: Resolves all references using the auxiliary files

## Troubleshooting

### Missing Packages
If you see errors about missing packages:
- **MiKTeX**: Will prompt you to install missing packages automatically
- **TeX Live**: Install missing packages manually:
  ```bash
  sudo tlmgr install <package-name>
  ```

### Encoding Issues
If you see character encoding errors:
- Ensure the file is saved with UTF-8 encoding
- Check that `\usepackage[utf8]{inputenc}` is included

### Bibliography/References
If references don't appear correctly:
- Run `pdflatex` twice (required for cross-references)
- Run `bibtex` if using bibliography files

### Large Document Compilation
If compilation is slow:
- Use `pdflatex` with draft mode: `pdflatex -draftmode Workshop-4-Report.tex`
- Disable syntax highlighting in code listings temporarily

## Output Files

After compilation, you'll find:
- `Workshop-4-Report.pdf` - The final PDF document
- `Workshop-4-Report.aux` - Auxiliary file for references
- `Workshop-4-Report.toc` - Table of contents data
- `Workshop-4-Report.lof` - List of figures data
- `Workshop-4-Report.lot` - List of tables data
- `Workshop-4-Report.log` - Compilation log

You only need to keep the `.tex` and `.pdf` files. The others can be regenerated.

## Quick Compilation Command

For convenience, here's a one-liner that compiles twice:

**Windows (PowerShell):**
```powershell
pdflatex Workshop-4-Report.tex; pdflatex Workshop-4-Report.tex
```

**Linux/macOS:**
```bash
pdflatex Workshop-4-Report.tex && pdflatex Workshop-4-Report.tex
```

## Need Help?

- LaTeX Stack Exchange: https://tex.stackexchange.com/
- Overleaf Documentation: https://www.overleaf.com/learn
- LaTeX Project: https://www.latex-project.org/help/documentation/



