import { memo } from "react"
import SwitchSelector from "react-switch-selector"

export default memo(function SearchBar({ onChange, setText }: { onChange: (newValue: string) => void, setText: React.Dispatch<React.SetStateAction<string>> }) {
    console.log('render');
    
    return <>
        <div className="your-required-wrapper" style={{ width: 200, height: 50, fontSize: '19px' }}>
            <SwitchSelector
                // @ts-ignore
                onChange={onChange}
                options={[
                    {
                        label: "Moje",
                        value: 'my',
                        selectedBackgroundColor: '#27ae60'
                    },
                    {
                        label: "Zapisane",
                        value: "saved",
                        selectedBackgroundColor: '#27ae60'
                    }
                ]}
                initialSelectedIndex={0}
                backgroundColor={"#e1f6f4"}
                fontColor={"black"}
            />
        </div>
        <input onChange={(e) => { setText(e.currentTarget.value) }} className="search__input" type="text" placeholder="Szukaj"></input>
    </>
})