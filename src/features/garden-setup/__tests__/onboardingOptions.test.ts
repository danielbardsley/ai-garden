import { gardenNameSuggestions, growingSpaceOptions } from '../onboardingOptions';

describe('onboarding options', () => {
  it('includes standard garden choices beyond balconies and roof decks', () => {
    expect(gardenNameSuggestions).toEqual(expect.arrayContaining(['Back Garden', 'Kitchen Garden', 'Allotment Plot']));
    expect(growingSpaceOptions.map((option) => option.id)).toEqual(expect.arrayContaining(['in-ground', 'raised-beds', 'allotment', 'greenhouse']));
  });

  it('does not include starter plants as an onboarding option set', () => {
    expect(growingSpaceOptions.map((option) => option.id)).not.toEqual(expect.arrayContaining(['basil', 'mint', 'tomato']));
  });
});
