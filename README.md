# Filtering browser extension

Are you bored by scrolling through products simply because filtering options are missing? Or you end up with dozens of open tabs for every product that interests you?

This browser extension will try to resolve those problems.

# IMPORTANT:

This is just the begining of this project. Many features currently unsupported.
You can see it in action [here](https://abitofs.github.io/FilteringExtension/)

## Features:

- Allows you to manually hide unwanted items or select which are your favourite and review them later

## Planned:

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

- [X] Manually select 2 list element's id on webpage
- [X] Add filtering topbar on webpage (placeholder)
- [X] Add ignore and favourite buttons to each list item
- [X] Ignore button hides item
- [X] Favourite button saves item to favourites list
- [X] Favourites and ignored buttons on topbar hide full list and show relevant

# That's done. Great

- [ ] Create manifest
- [ ] Create chrome_utils.ts with functionality of dev_utils.ts, but using extension api
- [ ] Serialize list items better than just innerHTML (global template with params)

- [ ] Switch to frontend framework (probably preact)

## Needs fixing:

- [X] Disable links while manually selecting items
- [ ] Check if change of states works properly

## Usage guide

1. Open popup (by clicking icon)
-> 2. If no config, click to choose list manually (else go to step x.)
3. Click first list item unique id (may be just )
> Red border should be around 1st item and Blue around whole list.
> Try to match it, if impossible, that site is currently unsupported
4. HOLD Shift, while moving mouse 