// Define your onboarding questions here
// You can easily modify this array to add/remove/change questions

const onboardingQuestions = [
    {
        id: 'age',
        text: 'Please enter your age?',
        type: 'slider',
        min: 16,
        max: 35,
        defaultValue: 18,
        required: true
    },
    {
        id: 'city_of_residence',
        text: 'City of residence?',
        type: 'text',
        placeholder: 'Enter your city',
        required: true
    },
    {
        id: 'highest_education',
        text: 'Highest Level of Education?',
        type: 'dropdown',
        options: [
            '10th',
            '12th',
            'Graduation',
            'Masters'
        ],
        required: true
    },
    {
        id: 'school_college_name',
        text: 'School/College Name?',
        type: 'text',
        placeholder: 'Enter your school/college name',
        required: true
    },
    {
        id: 'year_of_passing',
        text: 'Year of Passing Out School/College?',
        type: 'slider',
        min: 2015,
        max: 2035,
        defaultValue: 2024,
        required: true
    },
    {
        id: 'part_of_ncc',
        text: 'Part of NCC?',
        type: 'radio',
        options: [
            'Yes',
            'No'
        ],
        required: true
    },
    {
        id: 'ncc_unit',
        text: 'NCC Unit?',
        type: 'text',
        placeholder: 'Enter your NCC unit',
        required: false,
        conditionalOn: {
            questionId: 'part_of_ncc',
            value: 'Yes'
        }
    },
    {
        id: 'ncc_passing_year',
        text: 'NCC Passing Out Year?',
        type: 'slider',
        min: 2015,
        max: 2035,
        defaultValue: 2024,
        required: false,
        conditionalOn: {
            questionId: 'part_of_ncc',
            value: 'Yes'
        }
    },
    {
        id: 'ssb_preparation_stage',
        text: 'What stage are you at in SSB preparation?',
        type: 'radio',
        options: [
            'Beginner',
            'Intermediate',
            'Appeared Before',
            'Recommended Before',
            'Reappearing (Screened Out)',
            'Reappearing (Conference Out)'
        ],
        required: true
    },
    {
        id: 'entry_type',
        text: 'Which entry are you targeting?',
        type: 'checkbox',
        options: [
            'NDA',
            'CDS',
            'AFCAT',
            'TES',
            'NCC',
            'Tech', 
            'Service Entry',
            'Others'
        ],
        required: true
    },
    {
        id: 'struggle_area',
        text: 'Which area do you struggle with the most?',
        type: 'checkbox',
        options: [
            'Communication',
            'Time Management',
            'Confidence',
            'Consistency',
            'Psychology',
            'Interview',
            'GTO Tasks'
        ],
        required: true
    },
    {
        id: 'daily_dedication',
        text: 'How many hours can you dedicate daily?',
        type: 'radio',
        options: [
            '0-30 mins',
            '1-2 hours',
            '2-4 hours',
            '4+ hours',
            'Flexible'
        ],
        required: true
    }
];

module.exports = onboardingQuestions;
