import { memo } from "react"
import SwitchSelector from "react-switch-selector"

export default memo(function SearchBar({ onChange, page, setText }: { onChange: (newValue: string) => void, page: 'private' | 'public', setText: React.Dispatch<React.SetStateAction<string>> }) {

    return <>
        <div className="your-required-wrapper" style={{ width: 200, height: 50, fontSize: '19px' }}>
            <SwitchSelector
                // @ts-ignore
                onChange={onChange}

                options={
                    page === 'public'
                        ? [
                            {
                                label: "Ocena",
                                value: 'rating',
                                selectedBackgroundColor: '#27ae60'
                            },
                            {
                                label: "Wszystko",
                                value: "all",
                                selectedBackgroundColor: '#27ae60'
                            }
                        ]
                        : [
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
                        ]
                }
                initialSelectedIndex={0}
                backgroundColor={"#e1f6f4"}
                fontColor={"black"}
            />
        </div>
        <input onChange={(e) => { setText(e.currentTarget.value) }} className="search__input" type="text" placeholder="Szukaj"></input>
    </>
})