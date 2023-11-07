import Button from 'react-bootstrap/Button';
import "../../styles/index.css";

function PrimaryButton({Text, onClick}) {

    const ButtonText= Text;
    
    return (
        <>
            <Button id="PrimaryButton" onClick={onClick}>{ButtonText}</Button>
        </>
    );
}

export default PrimaryButton;