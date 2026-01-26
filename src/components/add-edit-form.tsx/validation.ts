import * as yup from 'yup';

export const scenarioSchema = yup.object({
    ticket: yup.string().required('Ticket is required'),

    title: yup.string().required('Title is required'),

    description: yup.string().required('Description is required'),

    steps: yup
        .array()
        .of(
            yup.object({
                value: yup.string().test('step-required', function (value) {
                    if (value) return true;

                    const index = Number(this.path?.match(/\d+/)?.[0]);

                    return this.createError({
                        message: `Step ${index + 1} is required`,
                    });
                }),
            })
        )
        .required(),

    expectedResult: yup.string().required('Expected result is required'),

    components: yup
        .array()
        .of(
            yup.object({
                label: yup.string().required(),
                value: yup.string().required(),
            })
        )
        .min(1, 'Select at least one component')
        .required(),
});
