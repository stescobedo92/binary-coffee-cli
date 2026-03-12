# Binary Coffee CLI

Terminal UI client for [Binary Coffee](https://binary.coffee) blog. Browse posts, search content, explore tags, and interact with the community - all from your terminal.

## Features

- **Interactive TUI** - Full terminal user interface with keyboard navigation
- **Browse Posts** - Paginated list of latest blog posts with metadata
- **Post Detail** - Read post content with scrolling, view comments
- **Search** - Search posts by title
- **Tags** - Browse and filter posts by tags
- **Authentication** - Login to your Binary Coffee account
- **Open in Browser** - Quick link to open posts in your default browser
- **CLI Commands** - Non-interactive commands for scripting

## Installation

```bash
npm install -g binary-coffee-cli
```

## Usage

### Interactive TUI (default)

```bash
bncf
```

### CLI Commands

```bash
# List latest posts
bncf posts
bncf posts --page 2 --size 5

# Search posts
bncf search "javascript"

# List tags
bncf tags

# Authentication
bncf login
bncf logout
bncf whoami
```

## TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `Down` | Move down |
| `k` / `Up` | Move up |
| `Enter` | Select / confirm |
| `n` | Next page |
| `p` | Previous page |
| `c` | Toggle comments (in post detail) |
| `o` | Open in browser (in post detail) |
| `q` / `Esc` | Go back / quit |

## Configuration

Set custom API URL:

```bash
export BINARY_COFFEE_API=https://your-instance.com
```

## Development

```bash
git clone https://github.com/stescobedo92/binary-coffee-cli.git
cd binary-coffee-cli
npm install
npm run dev
```

## License

ISC
