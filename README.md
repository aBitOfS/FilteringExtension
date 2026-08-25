# Filtering browser extension

Are you bored by scrolling through products simply because filtering options are missing? Or you end up with dozens of open tabs for every product that interests you?

This browser extension will try to resolve those problems.

# IMPORTANT:

This is just the begining of this project. Many features currently unsupported.
You can see it in action [here](https://abitofs.github.io/FilteringExtension/)

## Features:

- Allows you to manually hide unwanted items or select which are your favourite and review them later

### Planned:

- Works on almost any site
- Allows you to filter and sort by any property visible at item list,
    #### In the future
    - on all pages of one site (so no need to click next button)
    - and on item page (so even if property is not visible without opening individual items)
- Suggests preconfigured sorting and filtering options
- Allows to save filtered and sorted lists locally

### Maybe in the future:
- Allows you to sync lists between devices
- Allows to customize item's appearance
- Allows to combine items from multiple websites for broader choice and comparing prices (with same items grupping)
- Connects with external data sources so you can eg. sort pc's by thirdparty cpu benchmark
- Safely connects to AI chatbot to automaticly match your complicated criteria

## Todo:

- [ ] Create proper frontend with preact
    - [ ] Explain permission popup
    - [ ] Guided manual setup
    - [ ] Filters
    - [ ] Each item controls

- [ ] Test askedForPermission message
- [ ] Serialize list items better than just innerHTML (global template with params)

## Usage guide

### Installation

### New webpage setup

1. Click icon (if pinned)/extensions -> Filtering Extension
2. Click allow if you want this extension to run everytime and deny if only once
3. Click 2 list items' unique ids (may be names if unique)
> Links and buttons are disabled - no need to worry about clicking sth wrong
4. Check if items are detected correctly
> Red border should be around each item, blue around whole list and green highlight on all ids.
> If not matched try clicking other items' ids, especially in next row (if grid)
5. Click done.

### Marking and filtering items

- You can click favourite or ignore button under each item to add it to that category
- Then you can view them by clicking appreciable button over the list

## Issues

### Items not detected correctly

### No images/dynamicly loaded data on items

### Wrong styling