import { Scenario } from '../../api/types';

export const getDefaultValues = (data: Scenario | undefined) => {
    return data
        ? {
              ticket: data.ticket,
              title: data.title,
              description: data.description,
              steps: data.steps.map(s => ({ value: s })),
              expectedResult: data.expectedResult,
              components: data.components.map(c => ({
                  label: c,
                  value: c,
              })),
          }
        : {
              ticket: '',
              title: '',
              description: '',
              steps: [{ value: '' }],
              expectedResult: '',
              components: [],
          };
};
