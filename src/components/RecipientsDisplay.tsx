import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import RecipientsBadge from './RecipientsBadge';

// Start of RecipientsTooltip component
type RecipientsTooltipProps = PropsWithChildren<{ message: string }>

function RecipientsTooltip({ message, children, ...rest }: RecipientsTooltipProps) {
  // state to show/hide the tooltip
  const [visible, setVisible] = useState(false);

  const showTooltip = () => {
    setVisible(true);
  };

  const hideTooltip = () => {
    setVisible(false);
  };

  return (
    <div {...rest} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {visible && (
        <div className='tool-tip'>
          {message}
        </div>
      )}
    </div>
  );
}

const RecipientsTooltipWithStyle = styled(RecipientsTooltip)` 
  .tool-tip {
    display: flex;
    align-items: center;
    margin-top: 8px 8px 0px 0px;
    padding: 8px 16px;
    color:#f0f0f0;
    background-color:#666;
    border-radius: 24px;    
    position: fixed;
    top: 8px;
    right: 8px;
    white-space: break-spaces;
  }
`
// End of RecipientsTooltip component



// Start of RecipientsDisplay component
type RecipientsDisplayProps = PropsWithChildren<{ recipients: string[] }>

function RecipientsDisplay({ recipients, ...rest }: RecipientsDisplayProps) {
  const containerElementRef = useRef<HTMLDivElement>(null);
  const recipientElementRef = useRef<HTMLSpanElement>(null);
  const tripleDotElementRef = useRef<HTMLSpanElement>(null);
  const [numTruncated, setNumTruncated] = useState(1);

  useEffect(() => {
    const handleRecipient = () => {
      // get the width of available space in the cell
      const containerWidth = containerElementRef.current?.offsetWidth || 0;
      // get the width of the string , ... which is added when recipient list has been trimmed
      const tripleDotWidth = tripleDotElementRef.current?.offsetWidth || 0;
      // get the width of the Badge component
      const badgeWidth = containerElementRef.current?.children[1]?.clientWidth || 0;

      if (recipientElementRef.current) {
        if (recipients.length === 1) {
          recipientElementRef.current.innerHTML = recipients[0];
          setNumTruncated(0);
        } else {
          let sliceIndex = 2;
          while (sliceIndex <= recipients.length) {
            recipientElementRef.current.innerHTML = recipients.slice(0, sliceIndex).join(', ');
            if (recipientElementRef.current?.offsetWidth + badgeWidth + tripleDotWidth > containerWidth) {
              recipientElementRef.current.innerHTML = recipients.slice(0, sliceIndex - 1).join(', ');
              setNumTruncated(recipients.length - sliceIndex + 1);
              sliceIndex = recipients.length + 1;
            } else {
              sliceIndex++;
              setNumTruncated(0);
            }
          }
        }
      }
    }

    const handleResize = () => {
      handleRecipient();
    };

    window.addEventListener('resize', handleResize);
    handleRecipient();

    // clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return <div {...rest} ref={containerElementRef}>
    <div className='recipient-container'><span className='recipients' ref={recipientElementRef}></span>{!!numTruncated && <span ref={tripleDotElementRef}>, ...</span>}</div>
    {!!numTruncated && (<RecipientsTooltipWithStyle message={recipients.join(', ')}><RecipientsBadge numTruncated={numTruncated} /></RecipientsTooltipWithStyle>)}
  </div>
}

export default styled(RecipientsDisplay)`
    display: flex; 
    align-items: center;
    justify-content: space-between;

    .recipient-container {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
`
// End of RecipientsDisplay component