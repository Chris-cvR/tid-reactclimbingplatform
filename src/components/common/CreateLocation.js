import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import { Button } from 'antd';
import Parse from 'parse/dist/parse.min.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import LocationModal from './LocationModal';

const CreateLocation = ({show, handleClose}) => {
    const [formData, setFormData] = useState([
        { id: 1, label: 'Title', type: 'text', value: '' },
        { id: 2, label: 'Latitude', type: 'number', value: '' },
        { id: 3, label: 'Longitude', type: 'number', value: '' },
        { id: 4, label: 'Country', type: 'text', value: '' },
        { id: 5, label: 'Type', type: 'checkbox', value: '', options: ['Alpine', 'Boulder', 'Cliff', 'Freeclimb', 'Gym', 'Horizontal', 'Ice', 'Indoor', 'Lead', 'Outdoor', 'Speedclimb', 'Sport', 'Urban'] },
        { id: 6, label: 'Difficulty', type: 'text', value: '' },
        { id: 7, label: 'Description', type: 'text', value: '' },
        { id: 8, label: 'Picture', type: 'file', value: null },
    ]);

    const [inputError, setInputError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // function valueFor(label) {
    //     const field = formData.find(item => item.label === label);
    //     return field ? field.value : undefined;
    // }

    // const handleInputChange = (e, id) => {
    //     let value = id === 8 ? e.target.files[0] : e.target.value;

    //     const updatedFormData = formData.map(item =>
    //         item.id === id ? { ...item, value: value } : item
    //     );

    //     setFormData(updatedFormData);
    // };

    const handleInputChange = (label, value) => {
        const updatedFormData = formData.map(item =>
            item.label === label ? { ...item, value: value } : item
        );

        setFormData(updatedFormData);
    };

    const valueFor = (label) => {
        const item = formData.find(item => item.label === label);
        return item ? item.value : '';
    };

    // const handleCloseModal = () => {
    //     setInputError(false);
    //     setShowSuccessMessage(false);
    //     handleClose();
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isAnyFieldEmpty = formData.some(item => item.type !== 'file' && (item.value === '' || item.value === null));

        if (isAnyFieldEmpty) {
            setInputError(true);
            return;
        }

        const Location = Parse.Object.extend('Location');
        const newLocation = new Location();

        const countryValue = valueFor("Country");
        const formattedCountry = countryValue && countryValue.trim() !== ""
            ? countryValue.trim().charAt(0).toUpperCase() + countryValue.slice(1).toLowerCase()
            : "";

        console.log("Formatted Country:", formattedCountry);

        const difficultyValue = valueFor("Difficulty");
        const formattedDifficulty = difficultyValue && difficultyValue.trim() !== ""
            ? difficultyValue.trim().charAt(0).toUpperCase() + difficultyValue.slice(1).toLowerCase()
            : "";

        console.log("Formatted Difficulty", formattedDifficulty);

        const imageFile = valueFor("Picture");
        const reader = new FileReader();

        reader.onloadend = async function () {
            const dataUri = reader.result;
            const imageFileName = imageFile.name;

            try {
                const parseFile = new Parse.File(imageFileName, { base64: dataUri });
                const savedFile = await parseFile.save();

                newLocation.set("Name", valueFor("Title"));
                newLocation.set("Latitude", Number(valueFor("Latitude")));
                newLocation.set("Longitude", Number(valueFor("Longitude")));
                newLocation.set("Type", valueFor("Type"));
                newLocation.set("Description", valueFor("Description"));
                newLocation.set("Picture", savedFile);

                var Countries = Parse.Object.extend("Countries");
                var query = new Parse.Query(Countries);

                var Difficulty = Parse.Object.extend("Difficulty");
                var querydifficulty = new Parse.Query(Difficulty);

                query.equalTo("Country", formattedCountry);
                querydifficulty.equalTo("Difficulty", formattedDifficulty);

                const country = await query.first();
                if (!country) {
                    const newCountry = new Countries();
                    newCountry.set("Country", formattedCountry);
                    await newCountry.save();
                    newLocation.set("Country", newCountry);
                } else {
                    newLocation.set("Country", country);
                }

                const difficulty = await querydifficulty.first();
                if (!difficulty) {
                    const newDifficulty = new Difficulty();
                    newDifficulty.set("Difficulty", formattedDifficulty);
                    await newDifficulty.save();
                    newLocation.set("Difficulty", newDifficulty);
                } else {
                    newLocation.set("Difficulty", difficulty);
                }

                let loggedInUser = Parse.User.current();
                if (loggedInUser) {
                    newLocation.set("UserID", loggedInUser);
                } else {
                    console.log("No user logged in");
                }

                await newLocation.save();

                setSuccessMessage('Location created successfully!');
                setShowSuccessMessage(true);

                setFormData([
                    { id: 1, label: 'Title', type: 'text', value: '' },
                    { id: 2, label: 'Latitude', type: 'number', value: '' },
                    { id: 3, label: 'Longitude', type: 'number', value: '' },
                    { id: 4, label: 'Country', type: 'text', value: '' },
                    { id: 5, label: 'Type', type: 'checkbox', value: '', options: ['Alpine', 'Boulder', 'Cliff', 'Freeclimb', 'Gym', 'Horizontal', 'Ice', 'Indoor', 'Lead', 'Outdoor', 'Speedclimb', 'Sport', 'Urban'] },
                    { id: 6, label: 'Difficulty', type: 'text', value: '' },
                    { id: 7, label: 'Description', type: 'text', value: '' },
                    { id: 8, label: 'Picture', type: 'file', value: null },
                ]);

                setTimeout(() => {
                    window.location.reload();
                    setShowSuccessMessage(false);
                }, 2000);
            } catch (error) {
                console.error('Error while creating Location: ', error);
            }
        };

        reader.onerror = function (error) {
            console.log('Error: ', error);
        };

        reader.readAsDataURL(imageFile);
    };

    return (
        <>
            <LocationModal
                show={show}
                handleClose={handleClose}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                inputError={inputError}
                successMessage={successMessage}
                showSuccessMessage={showSuccessMessage}
            />
        </>
    );
};

export default CreateLocation;
